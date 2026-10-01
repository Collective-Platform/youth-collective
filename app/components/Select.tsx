import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type SelectProps = ComponentPropsWithoutRef<"select">;

export default function Select({ children, className, ...props }: SelectProps) {
  return (
    <div className="relative block">
      <select {...props} className={twMerge(className, "block w-full appearance-none pl-4 pr-10")}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-current" strokeWidth={2.5} />
    </div>
  );
}
