"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Menu, X, ChevronDown } from "lucide-react";
import Container from "./Container";

const navLinks = {
  findYourTribe: [
    { href: "/pre-teens", label: "Pre-teens" },
    { href: "/teens", label: "Teens" },
    { href: "/campus", label: "Campus" },
  ],
  practiceTheWay: [
    { href: "/community", label: "Live in Community" },
    { href: "/pray", label: "Pray" },
    // { href: "/serve", label: "Serve" },
    { href: "https://give.collective.my/", label: "Give", external: true },
  ],
  joinATeam: [
    // { href: "/serve/ss", label: "SS" },
    // { href: "/serve/mission", label: "Mission" },
    {
      href: "https://collective.my/ministries/",
      label: "Church",
      external: true,
    },
  ],
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

const DropdownSection = ({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) => (
  <NavigationMenu.Item className="relative">
    <NavigationMenu.Trigger className="group bg-transparent inline-flex items-center justify-center gap-1 rounded-md h-10 px-4 text-sm font-medium border-0 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
      {title}
      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </NavigationMenu.Trigger>
    <NavigationMenu.Content className="absolute top-full left-1/2 -translate-x-1/2 pt-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="bg-white shadow-lg rounded-md border border-slate-200 p-4 min-w-40">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            external={link.external}
            className="block w-full text-left"
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </NavigationMenu.Content>
  </NavigationMenu.Item>
);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Container className="min-h-12 md:min-h-16 flex items-center justify-between my-6 md:my-12 relative z-50">
      {/* Logo */}
      <div className="shrink-0">
        <Link
          href="/"
          className="whitespace-nowrap text-2xl font-heading md:text-3xl text-black no-underline tracking-tight"
        >
          Strictly Students
        </Link>
      </div>

      {/* Desktop Navigation Menu (hidden on mobile) */}
      <NavigationMenu.Root className="hidden lg:block relative">
        <NavigationMenu.List className="flex items-center gap-1 list-none m-0 p-0">
          <DropdownSection
            title="Find Your Tribe"
            links={navLinks.findYourTribe}
          />
          <DropdownSection
            title="Practice the Way"
            links={navLinks.practiceTheWay}
          />
          <DropdownSection title="Join A Team" links={navLinks.joinATeam} />
        </NavigationMenu.List>
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
            <VisuallyHidden.Root>
              <Dialog.Title>Navigation Menu</Dialog.Title>
            </VisuallyHidden.Root>
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center mb-8">
              <Link
                href="/"
                className="text-2xl font-heading text-black no-underline"
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
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
}
