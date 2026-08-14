import { appendRegistration, updateRegistration } from "@/lib/google-sheets";
import { parseProgramRegistration, registrationToRow } from "@/lib/program-registration";
import { FULL_PAYMENT_PRICE_ID, INSTALLMENT_PRICE_ID, getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const registration = parseProgramRegistration(await request.json());
    const origin = new URL(request.url).origin;
    const stripe = getStripeClient();

    await appendRegistration(registrationToRow(registration));

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: registration.paymentOption === "full" ? "payment" : "subscription",
        customer_email: registration.email,
        client_reference_id: registration.registrationId,
        line_items: [
          {
            price: registration.paymentOption === "full" ? FULL_PAYMENT_PRICE_ID : INSTALLMENT_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          registrationId: registration.registrationId,
          paymentPlan: registration.paymentOption,
        },
        ...(registration.paymentOption === "full"
          ? {
              payment_intent_data: { metadata: { registrationId: registration.registrationId } },
            }
          : {
              subscription_data: { metadata: { registrationId: registration.registrationId } },
            }),
        success_url: `${origin}/learninglabs/registration/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/program`,
      },
      { idempotencyKey: `program-registration-${registration.registrationId}` },
    );

    if (!checkoutSession.url) throw new Error("Stripe did not return a checkout URL.");

    await updateRegistration(registration.registrationId, {
      "Stripe Checkout Session ID": checkoutSession.id,
    });

    return Response.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not begin checkout.";
    const status =
      message.startsWith("Please") || message.startsWith("Choose") || message.startsWith("Enter") || message.startsWith("Invalid")
        ? 400
        : 500;
    return Response.json({ error: status === 400 ? message : "We could not begin secure checkout. Please try again." }, { status });
  }
}
