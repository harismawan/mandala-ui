import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type LucideIcon } from "./Icon";
import s from "./Tabs.module.css";

export type Tab<K extends string = string> = { key: K; label: ReactNode; icon?: LucideIcon; count?: number };

// Controlled tab list; the owner decides where the value lives (state or the URL). Arrow keys move and select.
export function Tabs<K extends string>({
  tabs,
  value,
  onChange,
  label,
  vertical,
  variant = "underline",
  children,
}: {
  tabs: Tab<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  vertical?: boolean;
  variant?: "underline" | "pill";
  children?: ReactNode;
}) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const prev = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const i = tabs.findIndex((t) => t.key === value);
    let target = -1;
    if (e.key === next) target = (i + 1) % tabs.length;
    else if (e.key === prev) target = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = tabs.length - 1;
    if (target < 0) return;
    e.preventDefault();
    const t = tabs[target]!;
    onChange(t.key);
    list.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(t.key)}"]`)?.focus();
  };
  return (
    <div className={s.tabs} data-vertical={vertical || undefined} data-variant={variant}>
      <div
        ref={list}
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? "vertical" : undefined}
        className={s.list}
        onKeyDown={onKey}
      >
        {tabs.map((t) => {
          const selected = t.key === value;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${id}-${t.key}`}
              data-key={t.key}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={s.tab}
              onClick={() => onChange(t.key)}
            >
              {t.icon && <Icon icon={t.icon} size={16} />}
              <span>{t.label}</span>
              {t.count !== undefined && <span className={s.count}>{t.count}</span>}
            </button>
          );
        })}
      </div>
      {children !== undefined && (
        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${value}`} className={s.panel}>
          {children}
        </div>
      )}
    </div>
  );
}
