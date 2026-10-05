import { useState } from "react";
import s from "./Avatar.module.css";

export type AvatarSize = 16 | 20 | 24 | 28 | 32 | 40 | 48 | 64;

// Six hues that sit with the brand palette; the same username always gets the same one.
export const HUES = 6;
export function hueOf(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % HUES;
}

// First letter of the first and last word; bracketed prefixes such as "[RDL] Name" are skipped.
export function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((w) => w && !/^[[(].*[\])]$/.test(w))
    .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
    .filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  return (first + last).toUpperCase();
}

// Initials carry the name for assistive technology; a picture that fails to load falls back to them.
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
  const [failed, setFailed] = useState<string | undefined>();
  const cls = [s.avatar, className].filter(Boolean).join(" ");
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.4)) };
  if (src && failed !== src)
    return (
      <img
        className={cls}
        data-square={square || undefined}
        src={src}
        alt={name}
        width={size}
        height={size}
        style={style}
        onError={() => setFailed(src)}
      />
    );
  return (
    <span
      className={cls}
      data-hue={hueOf(id)}
      data-square={square || undefined}
      style={style}
      role="img"
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
