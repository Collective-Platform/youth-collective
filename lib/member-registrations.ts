import "server-only";

import { listExperienceRegistrationsForEmail } from "./google-sheets";

export type MemberRegistration = {
  id: string;
  title: string;
  dates: string;
  startsAt: Date;
  href: string;
  paymentLabel: "Payment confirmed" | "Payment plan active" | "Payment pending" | "Payment needs attention";
  paymentDetail: string | null;
};

function getPaymentSummary(registration: Awaited<ReturnType<typeof listExperienceRegistrationsForEmail>>[number]) {
  if (registration.paymentStatus === "Paid" || registration.paymentStatus === "Paid in full") {
    return { paymentLabel: "Payment confirmed" as const, paymentDetail: null };
  }

  if (registration.paymentStatus === "Subscription active" || registration.paymentStatus.startsWith("Installment ")) {
    return {
      paymentLabel: "Payment plan active" as const,
      paymentDetail: registration.installmentsPaid ? `${registration.installmentsPaid} instalments paid` : null,
    };
  }

  if (registration.paymentStatus === "Payment failed" || registration.lastPaymentFailure) {
    return { paymentLabel: "Payment needs attention" as const, paymentDetail: "Please check your payment email or contact the team." };
  }

  return {
    paymentLabel: "Payment pending" as const,
    paymentDetail: registration.paymentPlan ? "Registration recorded — payment is not confirmed yet." : null,
  };
}

/**
 * The dashboard-facing registration boundary. New programme sources can add
 * their own member-safe records here without changing the dashboard UI.
 */
export async function listMemberRegistrationsForEmail(email: string): Promise<MemberRegistration[]> {
  const experienceRegistrations = await listExperienceRegistrationsForEmail(email);

  return experienceRegistrations.map((registration) => ({
    id: registration.registrationId,
    title: "Learning Labs: Experience",
    dates: "6–12 December 2026",
    startsAt: new Date("2026-12-06T00:00:00+08:00"),
    href: "/learninglabs",
    ...getPaymentSummary(registration),
  }));
}
