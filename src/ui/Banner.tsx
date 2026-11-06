import type { ReactNode } from "react";
import { Icon, type LucideIcon } from "./Icon";
import s from "./Banner.module.css";

// A one-line notice across a page or the shell: an icon, the text (with any link), then an optional action.
export function Banner({
  icon,
  tone = "warning",
  action,
  className,
  children,
}: {
  icon: LucideIcon;
  tone?: "warning" | "info";
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className ? `${s.banner} ${className}` : s.banner} data-tone={tone} role="status">
      <Icon icon={icon} size={18} />
      <span className={s.text}>{children}</span>
      {action}
    </div>
  );
}
