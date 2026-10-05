import type { ReactNode } from "react";
import { Icon, type LucideIcon } from "./Icon";
import s from "./EmptyState.module.css";

export function EmptyState({
  icon,
  title,
  children,
  action,
  tone = "default",
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "warning" | "danger";
  compact?: boolean;
}) {
  return (
    <div className={s.state} data-tone={tone} data-compact={compact || undefined}>
      {icon && (
        <span className={s.icon}>
          <Icon icon={icon} size={compact ? 20 : 24} />
        </span>
      )}
      <h2 className={s.title}>{title}</h2>
      {children && <div className={s.body}>{children}</div>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}

// The product decides what counts as "not found" (Confluence and Jira both answer 404 for hidden and missing).
export function ErrorState({ error, notFound, action }: { error: unknown; notFound?: boolean; action?: ReactNode }) {
  if (notFound)
    return (
      <EmptyState title="Page not found" action={action}>
        <p>The page does not exist or you do not have permission to view it.</p>
      </EmptyState>
    );
  return (
    <div role="alert">
      <EmptyState title="Something went wrong" tone="danger" action={action}>
        <p>{error instanceof Error ? error.message : "Something went wrong"}</p>
      </EmptyState>
    </div>
  );
}
