"use client";

import { Settings } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type SessionSettingsDrawerProps = {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
};

export default function SessionSettingsDrawer({ action, children }: SessionSettingsDrawerProps) {
  const [open, setOpen] = useState(false);

  async function saveSession(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open Session settings"
          size="icon"
          type="button"
          variant="outline"
        >
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>Session settings</SheetTitle><SheetDescription>Update the Session details and check-in link.</SheetDescription></SheetHeader>
        <form action={saveSession} className="px-4 pb-6">{children}</form>
      </SheetContent>
    </Sheet>
  );
}
