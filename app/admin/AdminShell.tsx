import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
  currentPath: "/admin" | "/admin/classes" | "/admin/members" | "/admin/reports";
  email: string;
  preview?: boolean;
  previewMessage?: string;
  role: string;
};

export function AdminShell({ children, currentPath, email, preview = false, previewMessage = "Sample data only · Admin actions stay protected", role }: AdminShellProps) {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-muted/30 text-foreground">
      <div className="mx-auto grid min-h-screen min-w-0 max-w-[1600px] lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <AdminSidebar currentPath={currentPath} email={email} role={role} />
        <div className="min-w-0">
          {preview ? (
            <div className="px-4 pt-4 md:px-8 lg:px-10">
              <Alert>
                <AlertDescription>Local preview · {previewMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </main>
  );
}

export function AdminPageHeader({ children, description, title }: { children?: ReactNode; description: string; title: string }) {
  return (
    <header className="border-b bg-background px-4 py-6 md:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </header>
  );
}
