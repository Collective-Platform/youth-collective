"use client";

import { useEffect, useState } from "react";

import { EARLY_BIRD_PRICE_CUTOFF, isEarlyBirdPricing } from "@/lib/program-pricing";

type EarlyBirdNoticeProps = {
  className: string;
  lineBreak?: boolean;
};

export function useIsEarlyBirdPricing() {
  const [isEarlyBird, setIsEarlyBird] = useState(true);

  useEffect(() => {
    const updatePricing = () => setIsEarlyBird(isEarlyBirdPricing());
    updatePricing();

    const millisecondsUntilCutoff = EARLY_BIRD_PRICE_CUTOFF - Date.now();
    if (millisecondsUntilCutoff <= 0) return;

    const timeoutId = window.setTimeout(updatePricing, millisecondsUntilCutoff);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return isEarlyBird;
}

export default function EarlyBirdNotice({ className, lineBreak = false }: EarlyBirdNoticeProps) {
  const isEarlyBird = useIsEarlyBirdPricing();

  if (!isEarlyBird) return null;

  return (
    <p className={className}>
      (Early Bird: RM699{lineBreak ? <br /> : " "}ends 18 October)
    </p>
  );
}
