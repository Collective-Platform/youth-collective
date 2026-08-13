import Link from "next/link";
import { getRegistration } from "@/lib/google-sheets";
import { getStripeClient } from "@/lib/stripe";

type ConfirmationState = "confirmed" | "processing" | "unverified";

async function getConfirmationState(sessionId: string | undefined): Promise<ConfirmationState> {
  if (!sessionId?.startsWith("cs_")) return "unverified";

  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    const registrationId = session.client_reference_id;
    const metadataRegistrationId = session.metadata?.registrationId;
    const paymentPlan = session.metadata?.paymentPlan;
    const modeMatchesPaymentPlan =
      (paymentPlan === "full" && session.mode === "payment") ||
      (paymentPlan === "installments" && session.mode === "subscription");

    if (
      session.status !== "complete" ||
      !registrationId ||
      registrationId !== metadataRegistrationId ||
      !modeMatchesPaymentPlan
    ) {
      return "unverified";
    }

    const registration = await getRegistration(registrationId);
    if (!registration) return "unverified";

    return session.payment_status === "paid" || session.payment_status === "no_payment_required"
      ? "confirmed"
      : "processing";
  } catch {
    return "unverified";
  }
}

const content = {
  confirmed: {
    eyebrow: "Payment confirmed",
    title: "Thank you",
    message:
      "Your payment has been received and your registration is recorded. We’ll be in touch with the next steps.",
  },
  processing: {
    eyebrow: "Payment processing",
    title: "Almost there",
    message:
      "Stripe is still processing your payment. Your registration is recorded, and its payment status will update automatically after Stripe confirms it.",
  },
  unverified: {
    eyebrow: "Confirmation unavailable",
    title: "We can’t verify this payment",
    message:
      "We couldn’t verify a completed payment for this page. If you have paid, please contact us and keep your Stripe receipt for reference.",
  },
} as const;

export default async function RegistrationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const sessionIdValue = (await searchParams).session_id;
  const sessionId = typeof sessionIdValue === "string" ? sessionIdValue : undefined;
  const state = await getConfirmationState(sessionId);
  const pageContent = content[state];

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff1ed] p-6 text-black">
      <section className="max-w-xl border-2 border-black bg-white p-8 text-center shadow-[10px_10px_0_0_#f45c36] sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c53d1d]">{pageContent.eyebrow}</p>
        <h1 className="mt-5 font-heading text-4xl leading-[0.9] uppercase sm:text-6xl">{pageContent.title}</h1>
        <p className="mt-6 leading-relaxed">{pageContent.message}</p>
        <Link
          href="/program"
          className="mt-8 inline-block border-2 border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#f45c36] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f45c36]"
        >
          Back to the site
        </Link>
      </section>
    </main>
  );
}
