import Link from "next/link";

interface ProgramButtonProps {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "lg";
}

export default function ProgramButton({
  href,
  children,
  size = "lg",
}: ProgramButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-block bg-[#f45c36] text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 border-white border-2 ${
        size === "sm" ? "px-10 py-5 text-sm" : "px-12 py-5 text-xl"
      }`}
    >
      {children}
    </Link>
  );
}
