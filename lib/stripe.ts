import Stripe from "stripe";

export const FULL_PAYMENT_PRICE_ID = "price_1U3tLsHJ40gQ7FP8xhZB2iM0";
export const INSTALLMENT_PRICE_ID = "price_1U3tMKHJ40gQ7FP8VlAXiWZ6";

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe has not been configured.");
  return new Stripe(secretKey);
}
