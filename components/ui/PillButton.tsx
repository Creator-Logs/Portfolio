import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "orange" | "cream" | "ink";

const variants: Record<Variant, string> = {
  orange: "bg-orange text-cream hover:shadow-[0_0_24px_var(--color-orange-glow)]",
  cream: "bg-cream text-ink hover:shadow-[0_0_24px_rgba(255,237,215,.25)]",
  ink: "bg-ink text-cream border border-brown hover:border-grey-brown",
};

type Props = ComponentProps<typeof Link> & { variant?: Variant };

export function PillButton({ variant = "orange", className = "", ...props }: Props) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[14px] uppercase tracking-[0.04em] transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:scale-[1.03] ${variants[variant]} ${className}`}
    />
  );
}
