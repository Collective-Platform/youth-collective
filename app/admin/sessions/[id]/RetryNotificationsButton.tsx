"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function RetryNotificationsButton({ action }: { action: () => Promise<void> }) {
  const [isPending, setIsPending] = useState(false);
  return <Button disabled={isPending} onClick={async () => { setIsPending(true); try { await action(); } finally { setIsPending(false); } }} size="sm" type="button" variant="outline">{isPending ? "Retrying…" : "Retry failed emails"}</Button>;
}
