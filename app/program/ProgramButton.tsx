"use client";

interface ProgramButtonProps {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "lg";
  variant?: "orange" | "ink";
  registrationOpen: boolean;
}

export default function ProgramButton({
  href,
  children,
  size = "lg",
  variant = "orange",
  registrationOpen,
}: ProgramButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.slice(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  if (!registrationOpen) {
    return (
      <span
        className={`inline-block border-2 border-black bg-black text-white font-bold uppercase tracking-wider cursor-not-allowed opacity-70 ${
          size === "sm" ? "px-10 py-5 text-sm" : "px-12 py-5 text-xl"
        }`}
      >
        Registration Closed
      </span>
    );
  }

  const colorClasses =
    variant === "ink"
      ? "border-black bg-black text-white hover:bg-white hover:text-black hover:border-white focus-visible:outline-white"
      : "border-[#f45c36] bg-[#f45c36] text-white hover:bg-white hover:text-black hover:border-white focus-visible:outline-black";

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`inline-block border-2 font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 ${colorClasses} ${
        size === "sm" ? "px-10 py-5 text-sm" : "px-12 py-5 text-xl"
      }`}
    >
      {children}
    </a>
  );
}
