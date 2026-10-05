import s from "./Logo.module.css";

// Both marks share the family: a 32x32 orange tile, one white shape (stroke 3.75, round) and one teal accent.

// Atlas: a white peak ("A") with a teal horizon running through it as the crossbar.
export function AtlasMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={[s.mark, className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" className={s.tile} />
      <path d="M4 20.5h24" className={s.accent} />
      <path d="M7.5 26.5 16 6l8.5 20.5" className={s.shape} />
    </svg>
  );
}

// Loopline: a line with one loop on it (a bead on a string); the teal dot marks where the line starts.
export function LooplineMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={[s.mark, className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" className={s.tile} />
      <path d="M6 26 26 6" className={s.shape} />
      <circle cx="16" cy="16" r="5.25" className={s.shape} />
      <circle cx="6" cy="26" r="2.8" className={s.dot} />
    </svg>
  );
}
