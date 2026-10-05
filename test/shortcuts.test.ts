import { expect, test } from "bun:test";
import { isEditableTarget, ShortcutMatcher } from "../src/lib/shortcuts";

test("single keys and two-key sequences resolve; the prefix expires", () => {
  const m = new ShortcutMatcher(["/", "e", "[", "?", "g d", "g s"]);
  expect(m.press("/", 0)).toBe("/");
  expect(m.press("g", 1000)).toBeNull();
  expect(m.press("d", 1200)).toBe("g d");
  expect(m.press("g", 2000)).toBeNull();
  expect(m.press("x", 2100)).toBeNull(); // unknown second key clears the prefix
  expect(m.press("s", 2200)).toBeNull();
  expect(m.press("g", 3000)).toBeNull();
  expect(m.press("s", 3000 + 1500)).toBeNull(); // too slow
  expect(m.press("?", 5000)).toBe("?");
  expect(m.press("e", 5001)).toBe("e");
});

test("modifier combinations are never shortcuts", () => {
  const m = new ShortcutMatcher(["e"]);
  expect(m.press("e", 0, { ctrl: true })).toBeNull();
  expect(m.press("e", 0, { meta: true })).toBeNull();
  expect(m.press("e", 0, { alt: true })).toBeNull();
});

test("typing targets are left alone", () => {
  const el = (tag: string, attrs: Record<string, string> = {}) =>
    ({ tagName: tag, isContentEditable: attrs.editable === "true", closest: () => null }) as unknown as HTMLElement;
  expect(isEditableTarget(el("INPUT"))).toBe(true);
  expect(isEditableTarget(el("TEXTAREA"))).toBe(true);
  expect(isEditableTarget(el("SELECT"))).toBe(true);
  expect(isEditableTarget(el("DIV", { editable: "true" }))).toBe(true);
  expect(isEditableTarget(el("DIV"))).toBe(false);
  expect(isEditableTarget(null)).toBe(false);
});
