import Link from "next/link";

type Variant = "default" | "inverted-pill" | "inverted-square";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default:
    "inline-block bg-white text-black px-8 py-3 rounded-full font-heading hover:bg-gray-800 transition-colors border-2 border-black hover:text-white duration-300 text-sm",
  "inverted-pill":
    "inline-block px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-200 transition-colors duration-300",
  "inverted-square":
    "inline-block bg-white text-black font-bold uppercase text-sm px-6 py-3 rounded hover:bg-gray-200 transition-colors",
};

export default function CTAButton({
  href,
  children,
  variant = "default",
  external = false,
}: CTAButtonProps) {
  const className = variantStyles[variant];

  if (external || href.startsWith("#") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        {...(href.startsWith("http") && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
