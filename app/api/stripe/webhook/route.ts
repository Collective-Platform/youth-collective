import { getRegistration, updateRegistration } from "@/lib/google-sheets";
import { EARLY_BIRD_INSTALLMENT_PRICE_ID, LATE_BIRD_INSTALLMENT_PRICE_ID, getStripeClient } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

function stripeId(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id ?? "";
}

type InstallmentPlan = {
  count: 2 | 3;
  priceId: string;
};

function getInstallmentPlan(metadata: Stripe.Metadata | null): InstallmentPlan {
  return metadata?.installmentCount === "2"
    ? { count: 2, priceId: LATE_BIRD_INSTALLMENT_PRICE_ID }
    : { count: 3, priceId: EARLY_BIRD_INSTALLMENT_PRICE_ID };
}

async function setInstallmentSchedule(subscriptionId: string, registrationId: string, plan: InstallmentPlan) {
  const stripe = getStripeClient();
  const schedule = await stripe.subscriptionSchedules.create(
    { from_subscription: subscriptionId },
    { idempotencyKey: `program-installments-${subscriptionId}` },
  );

  if (!schedule.current_phase) throw new Error("Could not create the installment schedule.");

  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "cancel",
    metadata: { registrationId },
    proration_behavior: "none",
    phases: [
      {
        start_date: schedule.current_phase.start_date,
        duration: { interval: "month", interval_count: plan.count },
        items: [{ price: plan.priceId, quantity: 1 }],
        metadata: { registrationId, installmentCount: String(plan.count) },
      },
    ],
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const registrationId = session.client_reference_id ?? session.metadata?.registrationId;
  if (!registrationId) return;

  const paymentIntentId = stripeId(session.payment_intent);
  const subscriptionId = stripeId(session.subscription);
  const changes = {
    "Stripe Checkout Session ID": session.id,
    "Stripe Payment Intent ID": paymentIntentId,
    "Stripe Subscription ID": subscriptionId,
  };

  if (session.mode === "payment" && session.payment_status === "paid") {
    await updateRegistration(registrationId, {
      ...changes,
      "Payment status": "Paid",
      "Last payment date": new Date().toISOString(),
    });
    return;
  }

  if (session.mode === "subscription" && subscriptionId) {
    const installmentPlan = getInstallmentPlan(session.metadata);
    await setInstallmentSchedule(subscriptionId, registrationId, installmentPlan);
    const existing = await getRegistration(registrationId);
    if (existing?.row["Installments paid"] === `0/${installmentPlan.count}`) {
      await updateRegistration(registrationId, { ...changes, "Payment status": "Subscription active" });
    } else {
      await updateRegistration(registrationId, changes);
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const registrationId = invoice.parent?.subscription_details?.metadata?.registrationId;
  if (!registrationId) return;

  const existing = await getRegistration(registrationId);
  if (!existing) return;

  const installmentPlan = getInstallmentPlan(invoice.parent?.subscription_details?.metadata ?? null);

  const paidInvoiceIds = existing.row["Stripe Invoice IDs"].split(",").filter(Boolean);
  if (paidInvoiceIds.includes(invoice.id)) return;

  const count = Math.min(paidInvoiceIds.length + 1, installmentPlan.count);
  const allInvoiceIds = [...paidInvoiceIds, invoice.id].join(",");
  await updateRegistration(registrationId, {
    "Stripe Subscription ID": stripeId(invoice.parent?.subscription_details?.subscription ?? null),
    "Stripe Invoice IDs": allInvoiceIds,
    "Installments paid": `${count}/${installmentPlan.count}`,
    "Payment status": count === installmentPlan.count ? "Paid in full" : `Installment ${count}/${installmentPlan.count} paid`,
    "Last payment date": new Date().toISOString(),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const registrationId = invoice.parent?.subscription_details?.metadata?.registrationId;
  if (!registrationId) return;

  await updateRegistration(registrationId, {
    "Stripe Subscription ID": stripeId(invoice.parent?.subscription_details?.subscription ?? null),
    "Payment status": "Payment failed",
    "Last payment failure": new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return new Response("Webhook secret is not configured.", { status: 500 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing Stripe signature.", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await getStripeClient().webhooks.constructEventAsync(await request.text(), signature, webhookSecret);
  } catch {
    return new Response("Invalid Stripe signature.", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch {
    return new Response("Webhook processing failed.", { status: 500 });
  }

  return Response.json({ received: true });
}
