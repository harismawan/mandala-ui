// Dates show in the viewer's time zone (stock confluence.user.time.zone, set from the settings at load); UTC until
// then and for the server-rendered view. Stock's list carries four Java short ids that Intl does not know.
const JAVA_ZONES: Record<string, string> = {
  HST: "Pacific/Honolulu",
  AST: "America/Anchorage",
  ECT: "Europe/Paris",
  GMT: "Etc/GMT",
};
let zone = "UTC";
export function setTimeZone(id?: string) {
  const candidate = (id && JAVA_ZONES[id]) || id || "UTC";
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: candidate });
    zone = candidate;
  } catch {
    zone = "UTC";
  }
}
export const timeZone = () => zone;

export const day = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: zone })
    : "";

// Full timestamp for tooltips beside a relative time.
export const dateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: zone,
      })
    : "";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["minute", 60],
  ["hour", 60 * 60],
  ["day", 24 * 60 * 60],
];

// "just now", "2 hours ago", "yesterday"; older than a week shows the date so lists stay scannable.
export function relativeTime(iso?: string, now = new Date()): string {
  if (!iso) return "";
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds >= 7 * 24 * 60 * 60) return day(iso);
  let unit: Intl.RelativeTimeFormatUnit = "minute";
  let per = 60;
  for (const [u, s] of UNITS) if (seconds >= s) [unit, per] = [u, s];
  return rtf.format(-Math.floor(seconds / per), unit);
}

export function size(bytes?: number) {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
