"use client";

interface ProgramButtonProps {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "lg";
  registrationOpen: boolean;
}

export default function ProgramButton({
  href,
  children,
  size = "lg",
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
        className={`inline-block bg-gray-500 text-white font-bold uppercase tracking-wider border-gray-500 border-2 cursor-not-allowed opacity-70 ${
          size === "sm" ? "px-10 py-5 text-sm" : "px-12 py-5 text-xl"
        }`}
      >
        Registration Closed
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`inline-block bg-[#f45c36] text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 border-white border-2 ${
        size === "sm" ? "px-10 py-5 text-sm" : "px-12 py-5 text-xl"
      }`}
    >
      {children}
    </a>
  );
}
