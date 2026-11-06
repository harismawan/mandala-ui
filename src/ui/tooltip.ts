// Portaled, "smart" tooltip: one fixed-position host on <body> shows the text of whichever
// [data-tooltip] element is hovered or focused. Fixed positioning means no ancestor's overflow can clip
// it (the old CSS ::after bubble was cut by any scrollable menu, clamped/rounded block, or dialog body).
//
// Placement is smart: it prefers the side in data-tooltip-side (default: above), then flips to another
// side when that one would leave the viewport, and clamps into view. So it is not "always below" — a
// control with room above shows its tooltip above; a control at the top of the screen flips to below.
//
// Contract (unchanged from the CSS version): [data-tooltip] = text, [data-tooltip-side] = optional
// preference (top|bottom|left|right), paired with aria-label. Suppressed on disabled controls and while
// a control reports aria-expanded="true" (an open menu owns the screen).

const SHOW_DELAY_MS = 400;
const GAP = 6; // distance between the control and the bubble
const MARGIN = 4; // keep the bubble this far from the viewport edges

type Side = "top" | "bottom" | "left" | "right";

let host: HTMLDivElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let current: Element | null = null;
let shown = false; // the host popover is open (tracked: not every DOM knows :popover-open)

function targetOf(t: EventTarget | null): Element | null {
  return t instanceof Element ? t.closest("[data-tooltip]") : null;
}

function tipText(el: Element): string | null {
  if (el.hasAttribute("disabled")) return null;
  if (el.getAttribute("aria-expanded") === "true") return null;
  const text = el.getAttribute("data-tooltip");
  return text && text.trim() ? text : null;
}

function ensureHost(): HTMLDivElement {
  // Made again when something took the old one out of the document (a page or test that reset <body>).
  if (!host?.isConnected) {
    shown = false;
    host = document.createElement("div");
    host.className = "mandala-tooltip";
    // A manual popover lives in the top layer, so it shows over an open <dialog> or popover (a z-index on <body>
    // cannot); it never light-dismisses or closes the auto popovers around it.
    host.setAttribute("popover", "manual");
    host.setAttribute("role", "tooltip");
    host.setAttribute("aria-hidden", "true");
    document.body.append(host);
  }
  return host;
}

function hide(): void {
  clearTimeout(timer);
  timer = undefined;
  current = null;
  host?.removeAttribute("data-visible");
  if (host && shown) host.hidePopover();
  shown = false;
}

function place(el: Element, box: HTMLDivElement): void {
  const r = el.getBoundingClientRect();
  const bw = box.offsetWidth;
  const bh = box.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const preferred = (el.getAttribute("data-tooltip-side") as Side | null) ?? "top";
  const room: Record<Side, boolean> = {
    top: r.top - bh - GAP >= MARGIN,
    bottom: r.bottom + bh + GAP <= vh - MARGIN,
    left: r.left - bw - GAP >= MARGIN,
    right: r.right + bw + GAP <= vw - MARGIN,
  };
  // Preferred side first, then its opposite, then the remaining two.
  const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
  const order: Side[] = [preferred, opposite[preferred], "top", "bottom", "left", "right"];
  const side = order.find((s) => room[s]) ?? preferred;

  let left: number;
  let top: number;
  if (side === "top" || side === "bottom") {
    left = r.left + r.width / 2 - bw / 2;
    top = side === "top" ? r.top - bh - GAP : r.bottom + GAP;
  } else {
    top = r.top + r.height / 2 - bh / 2;
    left = side === "right" ? r.right + GAP : r.left - bw - GAP;
  }
  left = Math.max(MARGIN, Math.min(left, vw - bw - MARGIN));
  top = Math.max(MARGIN, Math.min(top, vh - bh - MARGIN));
  box.style.left = `${Math.round(left)}px`;
  box.style.top = `${Math.round(top)}px`;
}

function reveal(el: Element): void {
  const text = tipText(el);
  if (!text) {
    hide();
    return;
  }
  current = el;
  const box = ensureHost();
  box.textContent = text;
  // Re-shown each time so it lands above whatever dialog or popover opened since (top layer order is show order);
  // shown before place() so it can be measured.
  if (shown) box.hidePopover();
  box.showPopover();
  shown = true;
  place(el, box);
  box.setAttribute("data-visible", "");
}

function schedule(el: Element): void {
  if (!tipText(el)) {
    hide();
    return;
  }
  current = el;
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (current === el && el.isConnected) reveal(el);
  }, SHOW_DELAY_MS);
}

function onOver(e: PointerEvent): void {
  const el = targetOf(e.target);
  if (el && el !== current) schedule(el);
}

function onOut(e: PointerEvent): void {
  if (targetOf(e.relatedTarget) !== current) hide();
}

// Keyboard focus shows the tooltip immediately (no hover delay); a changed position hides it.
function onFocusIn(e: FocusEvent): void {
  const el = targetOf(e.target);
  if (el) reveal(el);
}

function onFocusOut(e: FocusEvent): void {
  if (targetOf(e.relatedTarget) !== current) hide();
}

let installed = false;

/** Installs the delegated listeners once. Called on import; safe to call again. */
export function installTooltips(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener("pointerover", onOver);
  document.addEventListener("pointerout", onOut);
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  document.addEventListener("pointerdown", hide);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
  // Any layout change under the bubble invalidates its measured position.
  window.addEventListener("scroll", hide, true);
  window.addEventListener("resize", hide);
}

installTooltips();
