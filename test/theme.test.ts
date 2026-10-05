import { expect, test } from "bun:test";
import { applyTheme, readTheme, resolveTheme, THEME_KEY } from "../src/lib/theme";

const storage = (value: string | null) => ({ getItem: () => value, setItem: () => undefined }) as unknown as Storage;
const root = () => {
  const attrs = new Map<string, string>();
  return {
    attrs,
    el: {
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      removeAttribute: (k: string) => attrs.delete(k),
    } as unknown as HTMLElement,
  };
};

test("readTheme accepts only the three modes", () => {
  expect(readTheme(storage("dark"))).toBe("dark");
  expect(readTheme(storage("light"))).toBe("light");
  expect(readTheme(storage("purple"))).toBe("system");
  expect(readTheme(storage(null))).toBe("system");
  expect(
    readTheme({
      getItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage),
  ).toBe("system");
});

test("resolveTheme follows the system only in system mode", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
  expect(resolveTheme("light", true)).toBe("light");
});

test("applyTheme sets data-theme for explicit modes and clears it for system", () => {
  const r = root();
  applyTheme("dark", r.el);
  expect(r.attrs.get("data-theme")).toBe("dark");
  applyTheme("system", r.el);
  expect(r.attrs.has("data-theme")).toBe(false);
  expect(THEME_KEY).toBe("atlas.theme");
});
