"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

type AdminAccountControlProps = {
  email: string;
  role: string;
};

export function AdminAccountControl({ email, role }: AdminAccountControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (response.ok) {
        router.replace("/classes");
        router.refresh();
      }
    });
  }

  return (
    <>
      <p className="text-xs font-medium text-muted-foreground">Admin account</p>
      <Button
        aria-label={`Sign out as ${email}`}
        className="mt-1 h-auto max-w-full justify-start px-0 py-1 font-normal"
        disabled={isPending}
        onClick={signOut}
        title="Sign out"
        type="button"
        variant="link"
      >
        {isPending ? "Signing out…" : email}
      </Button>
      <p className="text-xs capitalize text-muted-foreground">{role}</p>
    </>
  );
}
