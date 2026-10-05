import s from "./Avatar.module.css";

export type AvatarSize = 16 | 20 | 24 | 28 | 32 | 40 | 48 | 64;

// Six hues that sit with the brand palette; the same username always gets the same one.
export const HUES = 6;
export function hueOf(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % HUES;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  id = name,
  src,
  size = 24,
  square,
  className,
}: {
  name: string;
  id?: string;
  src?: string;
  size?: AvatarSize;
  square?: boolean;
  className?: string;
}) {
  const cls = [s.avatar, className].filter(Boolean).join(" ");
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.4)) };
  if (src)
    return (
      <img
        className={cls}
        data-square={square || undefined}
        src={src}
        alt=""
        width={size}
        height={size}
        style={style}
      />
    );
  return (
    <span className={cls} data-hue={hueOf(id)} data-square={square || undefined} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
