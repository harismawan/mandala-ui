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
