"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function AccountControl({ email }: { email: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      setMessage(null);

      try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) {
          setMessage("We couldn’t sign you out. Please try again.");
          return;
        }

        router.replace("/classes");
        router.refresh();
      } catch {
        setMessage("We couldn’t sign you out. Please try again.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 text-[#292823]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#292823]">Signed in</p>
      <p className="mt-2 break-words text-sm font-medium">{email}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold">
        <Link
          className="underline decoration-1 underline-offset-4 hover:text-black/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#292823]"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <button
          className="underline decoration-1 underline-offset-4 hover:text-black/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#292823] disabled:text-black/45"
          disabled={isPending}
          onClick={signOut}
          type="button"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
      {message ? <p className="mt-4 text-sm font-medium" role="status">{message}</p> : null}
    </div>
  );
}
