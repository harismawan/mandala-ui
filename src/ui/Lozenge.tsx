import type { ReactNode } from "react";
import s from "./Lozenge.module.css";

export type LozengeTone = "default" | "info" | "success" | "warning" | "danger" | "brand";
// Jira status categories map onto the status tokens (new grey, indeterminate teal, done green).
export type StatusCategory = "new" | "indeterminate" | "done";

export function Lozenge({
  children,
  tone,
  category,
  bold,
}: {
  children: ReactNode;
  tone?: LozengeTone;
  category?: StatusCategory | string;
  bold?: boolean;
}) {
  const resolved: LozengeTone =
    tone ?? (category === "done" ? "success" : category === "indeterminate" ? "info" : "default");
  return (
    <span
      className={s.lozenge}
      data-tone={resolved}
      data-category={category || undefined}
      data-bold={bold || undefined}
    >
      {children}
    </span>
  );
}
