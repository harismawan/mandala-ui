import { useEffect, useRef } from "react";

const SEQUENCE_MS = 1000;

// Resolves key presses against single keys ("/") and two-key sequences ("g d"), GitHub style.
export class ShortcutMatcher {
  private prefix: string | null = null;
  private at = 0;
  private readonly single = new Set<string>();
  private readonly sequences = new Map<string, Map<string, string>>();

  constructor(shortcuts: string[]) {
    for (const sc of shortcuts) {
      const parts = sc.split(" ");
      if (parts.length === 1) this.single.add(sc);
      else {
        const [a, b] = parts as [string, string];
        if (!this.sequences.has(a)) this.sequences.set(a, new Map());
        this.sequences.get(a)!.set(b, sc);
      }
    }
  }

  press(key: string, now: number, mods?: { ctrl?: boolean; meta?: boolean; alt?: boolean }): string | null {
    if (mods?.ctrl || mods?.meta || mods?.alt) {
      this.prefix = null;
      return null;
    }
    if (this.prefix !== null && now - this.at <= SEQUENCE_MS) {
      const hit = this.sequences.get(this.prefix)?.get(key) ?? null;
      this.prefix = null;
      if (hit) return hit;
    } else this.prefix = null;
    if (this.sequences.has(key)) {
      this.prefix = key;
      this.at = now;
      return null;
    }
    return this.single.has(key) ? key : null;
  }
}

export function isEditableTarget(el: EventTarget | null): boolean {
  if (!el || !(el as HTMLElement).tagName) return false;
  const h = el as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(h.tagName)) return true;
  if (h.isContentEditable) return true;
  return !!h.closest?.("[contenteditable=''],[contenteditable='true'],[role='textbox']");
}

// Global shortcuts for the shell; ignored while typing, inside an open dialog, and when a modifier is held.
export function useShortcuts(handlers: Record<string, () => void>) {
  const latest = useRef(handlers);
  latest.current = handlers;
  const keys = Object.keys(handlers).sort().join("|");
  useEffect(() => {
    const matcher = new ShortcutMatcher(keys.split("|").filter(Boolean));
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isEditableTarget(e.target)) return;
      if (document.querySelector("dialog[open]")) return;
      const hit = matcher.press(e.key, e.timeStamp, { ctrl: e.ctrlKey, meta: e.metaKey, alt: e.altKey });
      if (!hit) return;
      e.preventDefault();
      latest.current[hit]?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys]);
}
