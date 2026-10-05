import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { positionPopover, type MenuPlacement, type TriggerProps } from "./Menu";
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
