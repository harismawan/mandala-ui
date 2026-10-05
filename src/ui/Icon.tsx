import type { LucideIcon, LucideProps } from "lucide-react";

export type { LucideIcon };

// Thin wrapper so the icon library is swapped in one place. Decorative by default; pass `label` for standalone icons.
export function Icon({
  icon: I,
  size = 16,
  label,
  ...rest
}: { icon: LucideIcon; size?: 12 | 14 | 16 | 18 | 20 | 24 | 32; label?: string } & Omit<LucideProps, "size" | "ref">) {
  return (
    <I
      size={size}
      strokeWidth={size <= 16 ? 1.75 : 1.5}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable={false}
      {...rest}
    />
  );
}
