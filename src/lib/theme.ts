import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
export const THEME_KEY = "atlas.theme";
const MODES: ThemeMode[] = ["system", "light", "dark"];

export function readTheme(storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage): ThemeMode {
  try {
    const v = storage?.getItem(THEME_KEY);
    return MODES.includes(v as ThemeMode) ? (v as ThemeMode) : "system";
  } catch {
    return "system";
  }
}

export const resolveTheme = (mode: ThemeMode, systemDark: boolean): "light" | "dark" =>
  mode === "system" ? (systemDark ? "dark" : "light") : mode;

// tokens.css follows prefers-color-scheme unless data-theme pins a choice, so "system" means no attribute.
export function applyTheme(mode: ThemeMode, root: HTMLElement = document.documentElement) {
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

// Called from main.tsx before the first render; the CSP forbids an inline <script> in index.html.
export function initTheme() {
  applyTheme(readTheme());
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => readTheme());
  const [systemDark, setSystemDark] = useState(
    () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const set = useCallback((next: ThemeMode) => {
    setMode(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // private mode or blocked storage: the choice lasts for this page only
    }
  }, []);
  return { mode, resolved: resolveTheme(mode, systemDark), set };
}
