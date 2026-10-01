"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveMyProfileAction } from "../../lib/profile/actions";
import Select from "../components/Select";

type ProfileFormProps = {
  next?: string;
  profile?: {
    name: string;
    mobile: string;
    birthDate: string | null;
    ageBand: string | null;
  };
};

export default function ProfileForm({ next, profile }: ProfileFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(profile);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await saveMyProfileAction({
        name: String(formData.get("name") ?? ""),
        mobile: String(formData.get("mobile") ?? ""),
        birthDate: String(formData.get("birthDate") ?? "") || undefined,
        ageBand: String(formData.get("ageBand") ?? "") || undefined,
        bookingConsent: isEditing ? undefined : formData.get("bookingConsent") === "on",
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      if (next) {
        router.push(next);
      } else {
        setMessage("Your details have been saved.");
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="mx-auto mt-8 grid max-w-2xl gap-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Full name<input className="mt-1 block min-h-12 w-full rounded-lg border-2 border-black bg-white px-4 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black/30" defaultValue={profile?.name} name="name" required /></label>
        <label className="text-sm font-bold">Mobile number<input autoComplete="tel" className="mt-1 block min-h-12 w-full rounded-lg border-2 border-black bg-white px-4 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black/30" defaultValue={profile?.mobile} name="mobile" required type="tel" /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Birth date <span className="font-normal text-black/65">(optional)</span><input className="mt-1 block min-h-12 w-full rounded-lg border-2 border-black bg-white px-4 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black/30" defaultValue={profile?.birthDate ?? ""} name="birthDate" type="date" /></label>
        <label className="text-sm font-bold">Or age band <Select className="mt-1 min-h-12 rounded-lg border-2 border-black bg-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black/30" defaultValue={profile?.ageBand ?? ""} name="ageBand"><option value="">Choose one</option><option value="11–12">11–12</option><option value="13–15">13–15</option><option value="16–18">16–18</option><option value="19+">19+</option></Select></label>
      </div>
      {!isEditing ? (
        <>
          <label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 size-4 accent-black focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black/30" name="bookingConsent" required type="checkbox" /><span>I consent to my Booking and attendance being recorded for this Session.</span></label>
        </>
      ) : null}
      <div className="flex flex-wrap items-center gap-4"><button className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-black/75 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-black/30 disabled:bg-black/45" disabled={isPending} type="submit">{isPending ? "Saving…" : isEditing ? "Save changes" : "Save and continue"}</button>{message ? <p aria-live="polite" className="text-sm font-semibold" role={message === "Your details have been saved." ? "status" : "alert"}>{message}</p> : null}</div>
    </form>
  );
}
