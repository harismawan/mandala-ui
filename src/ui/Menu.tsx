import {
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { Icon, type LucideIcon } from "./Icon";
import s from "./Menu.module.css";

// `open`: items that load what they show (a permission check) wait for the menu to open.
type Ctx = { close: () => void; open: boolean };
const MenuCtx = createContext<Ctx | null>(null);

export type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end" | "right-start";

export type TriggerProps = {
  ref: (el: HTMLElement | null) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

// Data form of the menu (Loopline's shape): a flat item list, or sections with headings.
export type MenuItemData =
  | {
      label: ReactNode;
      onSelect?: () => void;
      href?: string;
      disabled?: boolean;
      danger?: boolean;
      bold?: boolean;
      checked?: boolean;
      keepOpen?: boolean;
      description?: ReactNode;
      shortcut?: string;
      icon?: LucideIcon | ReactNode;
    }
  | "separator";
export type MenuSection = { heading?: string; items: MenuItemData[] };

// Dropdown menu on the native Popover API (top layer, light dismiss, Esc). The owner renders the trigger from
// the props it gets so any button, avatar or row can open a menu. Items are roving-tabindex buttons. Give it
// either `children` (MenuItem/MenuSeparator/MenuGroup) or `items`/`sections`; `header` renders above either.
export function Menu({
  trigger,
  children,
  items,
  sections,
  header,
  label,
  placement = "bottom-start",
  width,
  onOpenChange,
  inline = false,
}: {
  trigger: (props: TriggerProps, open: boolean) => ReactNode;
  children?: ReactNode;
  items?: MenuItemData[];
  sections?: MenuSection[];
  header?: ReactNode;
  label: string;
  placement?: MenuPlacement;
  width?: number;
  onOpenChange?: (open: boolean) => void;
  /** A plain layer instead of the native Popover API, for a menu opened from inside another popover. */
  inline?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerEl = useRef<HTMLElement | null>(null);
  const pop = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<"first" | "last" | null>(null);

  const show = useCallback(
    (focus: "first" | "last" | null) => {
      focusOnOpen.current = focus;
      if (inline) setOpen(true);
      else pop.current?.showPopover();
    },
    [inline],
  );
  const close = useCallback(() => {
    if (!inline) return pop.current?.hidePopover();
    // As the native toggle handler does: focus inside the closing menu goes back to the trigger, not to <body>.
    if (document.activeElement && pop.current?.contains(document.activeElement)) triggerEl.current?.focus();
    setOpen(false);
  }, [inline]);

  // Native popover mode: its own toggle event is the source of truth (light dismiss and Esc hide it without us).
  useEffect(() => {
    if (inline) return;
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
  }, [inline, onOpenChange]);

  // Inline mode (a plain layer, not a native popover): report open state and dismiss on an outside press.
  useEffect(() => {
    if (!inline) return;
    onOpenChange?.(open);
  }, [inline, open, onOpenChange]);
  useEffect(() => {
    if (!inline || !open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!pop.current?.contains(t) && !triggerEl.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [inline, open]);

  useLayoutEffect(() => {
    if (!open || !pop.current || !triggerEl.current) return;
    positionPopover(pop.current, triggerEl.current, placement);
    const items = itemsOf(pop.current);
    const target = focusOnOpen.current === "last" ? items[items.length - 1] : items[0];
    target?.focus();
  }, [open, placement]);

  const onTriggerKey = (e: KeyboardEvent) => {
    if (inline && open && e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      show(e.key === "ArrowDown" ? "first" : "last");
    }
  };
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Inline mode has no native Esc: close this menu only. preventDefault keeps the keydown from becoming a close
    // request for the popover this menu sits in, so Esc peels one layer at a time.
    if (inline && e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      triggerEl.current?.focus();
      setOpen(false);
      return;
    }
    const items = itemsOf(e.currentTarget);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") close();
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const next = [...items.slice(i + 1), ...items.slice(0, i + 1)].find((el) =>
        (el.textContent ?? "").trim().toLowerCase().startsWith(k),
      );
      next?.focus();
    }
  };

  // `children` stay mounted while closed: an item may own a dialog that outlives the menu (a delete confirmation), and
  // an item that loads what it shows reads `open` from the context. The data form (`header`, `items`, `sections`)
  // holds nothing of its own and renders only while open, so a closed data menu's markup holds no items.
  const body = (
    <>
      {open && header && <div className={s.header}>{header}</div>}
      {children}
      {open && items && renderItems(items)}
      {open &&
        sections?.map((sec, i) =>
          sec.heading ? (
            <MenuGroup key={`${sec.heading}-${i}`} label={sec.heading}>
              {renderItems(sec.items)}
            </MenuGroup>
          ) : (
            <div key={i} role="group">
              {i > 0 && <MenuSeparator />}
              {renderItems(sec.items)}
            </div>
          ),
        )}
    </>
  );

  return (
    <MenuCtx.Provider value={{ close, open }}>
      {trigger(
        {
          ref: (el) => {
            triggerEl.current = el;
          },
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-controls": id,
          onClick: () => (open ? close() : show("first")),
          onKeyDown: onTriggerKey,
        },
        open,
      )}
      {inline ? (
        open && (
          <div
            ref={pop}
            id={id}
            role="menu"
            aria-label={label}
            className={s.menu}
            style={width ? { width } : undefined}
            onKeyDown={onMenuKey}
          >
            {body}
          </div>
        )
      ) : (
        <div
          ref={pop}
          id={id}
          popover="auto"
          role="menu"
          aria-label={label}
          className={s.menu}
          style={width ? { width } : undefined}
          onKeyDown={onMenuKey}
        >
          {body}
        </div>
      )}
    </MenuCtx.Provider>
  );
}

function renderItems(items: MenuItemData[]) {
  return items.map((it, i) =>
    it === "separator" ? (
      <MenuSeparator key={`sep-${i}`} />
    ) : (
      <MenuItem
        key={i}
        icon={it.icon}
        description={it.description}
        shortcut={it.shortcut}
        onSelect={it.onSelect}
        disabled={it.disabled}
        danger={it.danger}
        bold={it.bold}
        checked={it.checked}
        keepOpen={it.keepOpen}
        href={it.href}
      >
        {it.label}
      </MenuItem>
    ),
  );
}

// The common trigger: a button with the label (any node) and an optional chevron. Spread the Menu's trigger
// props onto it: `trigger={(p) => triggerButton(p, <span>Projects</span>)}`.
export function triggerButton(
  props: TriggerProps,
  content: ReactNode,
  opts: { chevron?: boolean; variant?: "subtle" | "default" | "primary"; className?: string; disabled?: boolean } = {},
) {
  const { chevron = true, variant = "subtle", className, disabled } = opts;
  return (
    <button
      {...props}
      type="button"
      data-variant={variant}
      className={[s.trigger, className].filter(Boolean).join(" ")}
      disabled={disabled}
    >
      {content}
      {chevron && <Icon icon={ChevronDown} size={14} className={s.chevron} />}
    </button>
  );
}

export function useMenu() {
  return useContext(MenuCtx);
}

export function MenuItem({
  icon,
  children,
  description,
  shortcut,
  onSelect,
  disabled,
  danger,
  bold,
  checked,
  keepOpen,
  href,
}: {
  icon?: LucideIcon | ReactNode;
  children: ReactNode;
  description?: ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
  bold?: boolean;
  checked?: boolean;
  keepOpen?: boolean;
  href?: string;
}) {
  const menu = useContext(MenuCtx);
  const select = () => {
    if (disabled) return;
    onSelect?.();
    if (!keepOpen) menu?.close();
  };
  const body = (
    <>
      {icon &&
        (isValidElement(icon) ? (
          <span className={s.icon}>{icon}</span>
        ) : (
          <Icon icon={icon as LucideIcon} size={16} className={s.icon} />
        ))}
      <span className={s.text}>
        <span className={s.label}>{children}</span>
        {description && <span className={s.description}>{description}</span>}
      </span>
      {shortcut && <kbd className={s.shortcut}>{shortcut}</kbd>}
      {checked !== undefined && <span className={s.check} data-on={checked || undefined} />}
    </>
  );
  const common = {
    className: s.item,
    "data-danger": danger || undefined,
    "data-bold": bold || undefined,
    tabIndex: -1,
    "aria-disabled": disabled || undefined,
  };
  if (href)
    return (
      <a {...common} role="menuitem" href={href} onClick={() => !keepOpen && menu?.close()}>
        {body}
      </a>
    );
  return (
    <button
      {...common}
      type="button"
      role={checked !== undefined ? "menuitemradio" : "menuitem"}
      aria-checked={checked}
      disabled={disabled}
      onClick={select}
    >
      {body}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className={s.separator} />;
}

export function MenuGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className={s.group}>
      <div className={s.groupLabel} aria-hidden="true">
        {label}
      </div>
      {children}
    </div>
  );
}

function itemsOf(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled]):not([aria-disabled="true"])')];
}

const GAP = 4;
// Fixed-position placement in the top layer, flipped when the preferred side runs out of viewport.
/** Anything with a viewport rectangle: an element, or a virtual anchor such as a text selection. */
export type PopoverAnchor = { getBoundingClientRect(): { top: number; left: number; right: number; bottom: number } };

export function positionPopover(pop: HTMLElement, anchor: PopoverAnchor, placement: MenuPlacement) {
  const a = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top: number;
  let left: number;
  const [side, align] = placement.split("-") as ["bottom" | "top" | "right", "start" | "end"];
  if (side === "right") {
    left = a.right + GAP;
    top = align === "start" ? a.top : a.bottom - h;
    if (left + w > vw - 8) left = a.left - w - GAP;
  } else {
    left = align === "end" ? a.right - w : a.left;
    const below = a.bottom + GAP;
    const above = a.top - h - GAP;
    top = side === "bottom" ? (below + h <= vh - 8 || above < 8 ? below : above) : above >= 8 ? above : below;
  }
  left = Math.max(8, Math.min(left, vw - w - 8));
  top = Math.max(8, Math.min(top, vh - h - 8));
  pop.style.top = `${Math.round(top)}px`;
  pop.style.left = `${Math.round(left)}px`;
}
