import Stripe from "stripe";

import { isEarlyBirdPricing } from "@/lib/program-pricing";

export const EARLY_BIRD_FULL_PAYMENT_PRICE_ID = "price_1U3tLsHJ40gQ7FP8xhZB2iM0";
export const LATE_BIRD_FULL_PAYMENT_PRICE_ID = "price_1U4F3pHJ40gQ7FP8qHU0TK8j";
export const EARLY_BIRD_INSTALLMENT_PRICE_ID = "price_1U3tMKHJ40gQ7FP8VlAXiWZ6";
export const LATE_BIRD_INSTALLMENT_PRICE_ID = "price_1U4FR8HJ40gQ7FP8l9kb90rC";

export function getFullPaymentPriceId(at = new Date()) {
  return isEarlyBirdPricing(at) ? EARLY_BIRD_FULL_PAYMENT_PRICE_ID : LATE_BIRD_FULL_PAYMENT_PRICE_ID;
}

export function getInstallmentPriceId(at = new Date()) {
  return isEarlyBirdPricing(at) ? EARLY_BIRD_INSTALLMENT_PRICE_ID : LATE_BIRD_INSTALLMENT_PRICE_ID;
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe has not been configured.");
  return new Stripe(secretKey);
}
