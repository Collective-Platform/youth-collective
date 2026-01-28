"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Menu, X } from "lucide-react";

const navLinks = {
  findYourTribe: [
    { href: "/pre-teens", label: "Pre-teens" },
    { href: "/teens", label: "Teens" },
    { href: "/campus", label: "Campus" },
  ],
  practiceTheWay: [
    { href: "/community", label: "Live in Community" },
    { href: "/alpha", label: "Alpha Youth" },
    { href: "/pray", label: "Pray" },
    { href: "/serve", label: "Serve" },
    { href: "https://give.collective.my/", label: "Give", external: true },
  ],
  joinATeam: [
    { href: "/serve/ss", label: "SS" },
    { href: "/serve/mission", label: "Mission" },
    {
      href: "https://collective.my/ministries/",
      label: "Church",
      external: true,
    },
  ],
  merch: [{ href: "/merch", label: "Store" }],
};

const NavLink = ({
  href,
  children,
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) => {
  const baseClasses =
    "text-black no-underline py-1 px-4 transition-all duration-300 hover:bg-black/5 hover:rounded";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${className}`}>
      {children}
    </Link>
  );
};

const NavSection = ({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) => (
  <div className="flex flex-col items-center gap-1">
    <p className="text-lg font-bold mb-3">{title}</p>
    {links.map((link) => (
      <NavLink key={link.href} href={link.href} external={link.external}>
        {link.label}
      </NavLink>
    ))}
  </div>
);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between mx-auto my-12 max-w-7xl px-4 md:px-8">
      {/* Logo */}
      <div className="shrink-0">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold text-black no-underline tracking-tight"
        >
          Strictly Students
        </Link>
      </div>

      {/* Desktop Navigation Menu (hidden on mobile) */}
      <NavigationMenu.Root className="hidden lg:block relative">
        <NavigationMenu.List className="flex items-center gap-1 list-none m-0 p-0">
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="bg-transparent inline-flex items-center justify-center rounded-md h-10 px-3 text-sm font-medium border-0 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
              <Menu className="w-6 h-6" />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="absolute left-0 top-0 w-max">
              <nav className="flex gap-24 p-8">
                <NavSection
                  title="Find Your Tribe"
                  links={navLinks.findYourTribe}
                />
                <NavSection
                  title="Practice the Way"
                  links={navLinks.practiceTheWay}
                />
                <NavSection title="Join A Team" links={navLinks.joinATeam} />
                <NavSection title="Merch" links={navLinks.merch} />
              </nav>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        <div className="absolute top-full left-0 flex justify-center">
          <NavigationMenu.Viewport className="relative bg-white shadow-lg rounded-md border border-slate-200 overflow-hidden" />
        </div>
      </NavigationMenu.Root>

      {/* Mobile Menu Trigger */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Trigger asChild>
          <button className="lg:hidden bg-transparent border-0 p-2 rounded-md hover:bg-black/5">
            <Menu className="w-6 h-6" />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 p-6 overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center mb-8">
              <Link
                href="/"
                className="text-2xl font-bold text-black no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Strictly Students
              </Link>
              <Dialog.Close asChild>
                <button className="p-2 rounded-md hover:bg-black/5">
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* Mobile Menu Links */}
            <nav className="flex flex-col gap-6">
              <div>
                <p className="text-lg font-bold mb-2">Find Your Tribe</p>
                {navLinks.findYourTribe.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-black no-underline hover:bg-black/5 rounded px-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div>
                <p className="text-lg font-bold mb-2">Practice the Way</p>
                {navLinks.practiceTheWay.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-black no-underline hover:bg-black/5 rounded px-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div>
                <p className="text-lg font-bold mb-2">Join A Team</p>
                {navLinks.joinATeam.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-black no-underline hover:bg-black/5 rounded px-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div>
                <p className="text-lg font-bold mb-2">Merch</p>
                {navLinks.merch.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-black no-underline hover:bg-black/5 rounded px-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
