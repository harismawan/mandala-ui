import { expect, test } from "bun:test";
import { day, relativeTime, size } from "../src/lib/format";

const now = new Date("2026-10-05T12:00:00Z");

test("relativeTime rounds to the largest whole unit and falls back to the date after a week", () => {
  expect(relativeTime("2026-10-05T11:59:40Z", now)).toBe("just now");
  expect(relativeTime("2026-10-05T11:58:00Z", now)).toBe("2 minutes ago");
  expect(relativeTime("2026-10-05T10:00:00Z", now)).toBe("2 hours ago");
  expect(relativeTime("2026-10-04T12:00:00Z", now)).toBe("yesterday");
  expect(relativeTime("2026-10-01T12:00:00Z", now)).toBe("4 days ago");
  expect(relativeTime("2026-09-20T12:00:00Z", now)).toBe(day("2026-09-20T12:00:00Z"));
  expect(relativeTime("2026-10-05T12:00:30Z", now)).toBe("just now"); // clock skew never says "in 30 seconds"
  expect(relativeTime(undefined, now)).toBe("");
});

test("day keeps the server-rendered UTC format", () => {
  expect(day("2026-10-05T23:30:00Z")).toBe("05 Oct 2026");
  expect(day(undefined)).toBe("");
});

test("size picks a unit", () => {
  expect(size(0)).toBe("0 B");
  expect(size(1536)).toBe("1.5 kB");
  expect(size(3 * 1024 * 1024)).toBe("3.0 MB");
  expect(size(undefined)).toBe("");
});
