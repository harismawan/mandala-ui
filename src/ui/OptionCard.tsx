import type { CSSProperties, ReactNode } from "react";
import { Icon, type LucideIcon } from "./Icon";
import s from "./OptionCard.module.css";

// A selectable card in a grid (content types, files, macros): a toggle button (aria-pressed) when `selected` is given,
// else a plain action (the macro list picks at once); double-click or the
// caller's own action confirms. `media` replaces the icon (a thumbnail); "tile" stacks media above the text.
export function OptionCard({
  icon,
  media,
  title,
  description,
  selected,
  onSelect,
  onConfirm,
  layout = "row",
}: {
  icon?: LucideIcon;
  media?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  onSelect: () => void;
  onConfirm?: () => void;
  layout?: "row" | "tile";
}) {
  return (
    <button
      type="button"
      className={s.card}
      data-layout={layout}
      aria-pressed={selected}
      onClick={onSelect}
      onDoubleClick={onConfirm}
    >
      {media ?? (icon && <Icon icon={icon} size={24} className={s.icon} />)}
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        {description && <span className={s.description}>{description}</span>}
      </span>
    </button>
  );
}

/** The grid of option cards; `label` names the group for assistive technology. */
export function OptionGrid({ label, min = 220, children }: { label: string; min?: number; children: ReactNode }) {
  return (
    <div className={s.grid} role="group" aria-label={label} style={{ "--option-min": `${min}px` } as CSSProperties}>
      {children}
    </div>
  );
}
