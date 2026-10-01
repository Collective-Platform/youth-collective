import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Strictly Students",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
