import s from "./Skeleton.module.css";

// Grey placeholders in the shape of the content that is loading; always announce as busy for screen readers.
export function Skeleton({ lines = 3, title, className }: { lines?: number; title?: boolean; className?: string }) {
  return (
    <div
      className={[s.skeleton, className].filter(Boolean).join(" ")}
      role="status"
      aria-label="Loading"
      aria-busy="true"
    >
      {title && <div className={s.title} />}
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={s.line} style={{ width: `${[92, 100, 78, 96, 64][i % 5]}%` }} />
      ))}
    </div>
  );
}

// Menu-item shaped rows (MenuItem geometry): a leading icon or avatar, a label and an optional description.
export function SkeletonItems({
  rows = 4,
  lead = 16,
  description = true,
}: {
  rows?: number;
  lead?: number;
  description?: boolean;
}) {
  return (
    <div className={s.items} role="status" aria-label="Loading" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={s.item} data-description={description || undefined}>
          <div className={s.lead} style={{ width: lead, height: lead }} />
          <div className={s.rowLines}>
            <div className={s.line} style={{ width: `${[64, 48, 76, 56, 70][i % 5]}%` }} />
            {description && <div className={s.line} data-thin style={{ width: "30%" }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className={s.skeleton} role="status" aria-label="Loading" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={s.row}>
          <div className={s.avatar} />
          <div className={s.rowLines}>
            <div className={s.line} style={{ width: `${[60, 44, 72, 52, 66][i % 5]}%` }} />
            <div className={s.line} data-thin style={{ width: "32%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
