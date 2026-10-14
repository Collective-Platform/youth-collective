// Malaysia observes MYT (UTC+8) year-round. Early-bird pricing ends when
// 2 November 2026 begins in Malaysia.
export const EARLY_BIRD_PRICE_CUTOFF = Date.parse("2026-11-02T00:00:00+08:00");

export function isEarlyBirdPricing(at = new Date()) {
  return at.getTime() < EARLY_BIRD_PRICE_CUTOFF;
}

export function getInstallmentTerms(at = new Date()) {
  return getInstallmentTermsForEarlyBird(isEarlyBirdPricing(at));
}

export function getInstallmentTermsForEarlyBird(isEarlyBird: boolean) {
  return isEarlyBird
    ? { amount: "233", count: 3 }
    : { amount: "399.50", count: 2 };
}
