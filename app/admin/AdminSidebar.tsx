import Link from "next/link";
import { ArrowLeft, ChartNoAxesCombined, FolderKanban, LayoutDashboard, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdminAccountControl } from "./AdminAccountControl";

type AdminSidebarProps = {
  email: string;
  role: string;
  currentPath: "/admin" | "/admin/classes" | "/admin/members" | "/admin/reports";
};

export function AdminSidebar({ email, role, currentPath }: AdminSidebarProps) {
  const links = [
    { href: "/admin", label: "Session Operations", icon: LayoutDashboard },
    { href: "/admin/members", label: "People", icon: UsersRound },
    { href: "/admin/reports", label: "Reports", icon: ChartNoAxesCombined },
    { href: "/admin/classes", label: "Programme Setup", icon: FolderKanban },
  ];

  return (
    <aside className="min-w-0 border-b bg-background px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-b-0 lg:py-6">
      <div className="mx-auto flex min-w-0 w-full max-w-7xl items-center justify-between gap-6 lg:flex-1 lg:flex-col lg:items-stretch">
        <div className="w-full min-w-0">
          <Link className="text-base font-semibold tracking-tight no-underline" href="/admin">Strictly Students</Link>
          <nav aria-label="Admin sections" className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:mt-10 lg:grid-cols-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = href === currentPath;
              return (
                <Link className={cn("inline-flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors lg:gap-3", isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")} href={href} key={label}>
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden lg:block">
          <Button asChild className="justify-start px-2" variant="ghost">
            <Link href="/classes"><ArrowLeft aria-hidden="true" />Return to Classes</Link>
          </Button>
          <Separator className="my-5" />
          <div>
            <AdminAccountControl email={email} role={role} />
          </div>
        </div>
      </div>
    </aside>
  );
}
