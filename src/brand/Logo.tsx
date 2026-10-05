import { AtlasMark, LooplineMark } from "./marks";
import s from "./Logo.module.css";

export type Product = "atlas" | "loopline";
const NAMES: Record<Product, string> = { atlas: "Atlas", loopline: "Loopline" };

export function LogoMark({ product, size = 24, className }: { product: Product; size?: number; className?: string }) {
  return product === "atlas" ? (
    <AtlasMark size={size} className={className} />
  ) : (
    <LooplineMark size={size} className={className} />
  );
}

// Mark plus wordmark. Colours come from the theme tokens so both stay legible in dark mode; `inverse` is for
// the login brand panel (white wordmark on teal).
export function Logo({
  product,
  variant = "full",
  size = 24,
  inverse,
  className,
}: {
  product: Product;
  variant?: "mark" | "full";
  size?: number;
  inverse?: boolean;
  className?: string;
}) {
  if (variant === "mark") return <LogoMark product={product} size={size} className={className} />;
  return (
    <span className={[s.logo, className].filter(Boolean).join(" ")} data-inverse={inverse || undefined}>
      <LogoMark product={product} size={size} />
      <span className={s.word} style={{ fontSize: Math.round(size * 0.75) }}>
        {NAMES[product]}
      </span>
    </span>
  );
}
