import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { positionPopover, type MenuPlacement, type PopoverAnchor, type TriggerProps } from "./Menu";
import s from "./Popover.module.css";

// Rich popover (notifications, pickers): same anchoring and light dismiss as Menu, free-form content inside.
export function Popover({
  trigger,
  children,
  label,
  placement = "bottom-end",
  width = 400,
  onOpenChange,
}: {
  trigger: (props: Omit<TriggerProps, "aria-haspopup"> & { "aria-haspopup": "dialog" }, open: boolean) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  label: string;
  placement?: MenuPlacement;
  width?: number;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerEl = useRef<HTMLElement | null>(null);
  const pop = useRef<HTMLDivElement>(null);
  const close = useCallback(() => pop.current?.hidePopover(), []);
  const show = useCallback(() => pop.current?.showPopover(), []);

  useEffect(() => {
    const el = pop.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      const next = (e as ToggleEvent).newState === "open";
      setOpen(next);
      onOpenChange?.(next);
      if (!next && document.activeElement && el.contains(document.activeElement)) triggerEl.current?.focus();
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, [onOpenChange]);

  useLayoutEffect(() => {
    if (!open || !pop.current || !triggerEl.current) return;
    positionPopover(pop.current, triggerEl.current, placement);
    pop.current.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [open, placement]);

  return (
    <>
      {trigger(
        {
          ref: (el) => {
            triggerEl.current = el;
          },
          "aria-haspopup": "dialog",
          "aria-expanded": open,
          "aria-controls": id,
          onClick: () => (open ? close() : show()),
          onKeyDown: () => undefined,
        },
        open,
      )}
      <div ref={pop} id={id} popover="auto" role="dialog" aria-label={label} className={s.popover} style={{ width }}>
        {open && (typeof children === "function" ? children(close) : children)}
      </div>
    </>
  );
}

// Placed like Popover, and hidden while the anchor is scrolled out of the viewport (rather than pinned to its edge).
function place(el: HTMLElement, anchor: PopoverAnchor, placement: MenuPlacement) {
  const a = anchor.getBoundingClientRect();
  el.style.visibility = a.bottom < 0 || a.top > window.innerHeight ? "hidden" : "";
  positionPopover(el, anchor, placement);
}

/** A popover its owner opens and places against an anchor of its own (a text selection, not a trigger button): the
 *  same surface and viewport-aware placement as Popover, without light dismiss or a focus change, so the user keeps
 *  typing where they were. Rendered only while `open`; re-placed on every render. */
export function AnchoredPopover({
  open,
  anchor,
  label,
  placement = "top-start",
  role = "dialog",
  className,
  children,
}: {
  open: boolean;
  anchor: PopoverAnchor | null;
  label: string;
  placement?: MenuPlacement;
  role?: "dialog" | "toolbar";
  className?: string;
  children: ReactNode;
}) {
  const pop = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  useLayoutEffect(() => {
    const el = pop.current;
    if (!el) return;
    if (open && anchor) {
      if (!shown.current) el.showPopover();
      shown.current = true;
      place(el, anchor, placement);
    } else if (shown.current) {
      shown.current = false;
      el.hidePopover();
    }
  }, [open, anchor, placement]);
  // The anchor moves without a render (the page or a scroll container scrolls, the window resizes): follow it.
  const latest = useRef({ anchor, placement });
  latest.current = { anchor, placement };
  useEffect(() => {
    if (!open) return;
    const follow = () => {
      const { anchor: a, placement: p } = latest.current;
      if (pop.current && a) place(pop.current, a, p);
    };
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [open]);
  return (
    <div
      ref={pop}
      popover="manual"
      role={role}
      aria-label={label}
      className={[s.popover, s.anchored, className].filter(Boolean).join(" ")}
    >
      {open && children}
    </div>
  );
}
