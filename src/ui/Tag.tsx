import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Icon } from "./Icon";
import s from "./Tag.module.css";

// A pill tag (labels, chosen people, columns, values), with an optional remove button. `fontSize` grows the pill with
// its text (a label heatmap's weights); the default is the compact 24px pill.
type TagProps = { children: ReactNode; disabled?: boolean; fontSize?: string } & (
  | { onRemove?: undefined; removeLabel?: undefined }
  /** removeLabel: the remove button's accessible name, e.g. "Remove label x". */
  | { onRemove: () => void; removeLabel: string }
);

export function Tag({ children, onRemove, removeLabel, disabled, fontSize }: TagProps) {
  return (
    <span
      className={s.tag}
      data-removable={onRemove ? true : undefined}
      data-sized={fontSize ? true : undefined}
      style={fontSize ? { fontSize } : undefined}
    >
      <span className={s.text}>{children}</span>
      {onRemove && (
        <button type="button" className={s.remove} aria-label={removeLabel} disabled={disabled} onClick={onRemove}>
          <Icon icon={X} size={12} />
        </button>
      )}
    </span>
  );
}

/** A wrapping row of tags. */
export function TagList({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className={s.list} role={label ? "group" : undefined} aria-label={label}>
      {children}
    </div>
  );
}
