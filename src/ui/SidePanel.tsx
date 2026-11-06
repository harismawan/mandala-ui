import { useEffect, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import s from "./SidePanel.module.css";

// The shell's right-hand panel (page details, Ask AI): rendered into the shell's third grid column (#rail-slot)
// through a portal, so the owner keeps its data; sticky beside the content, an overlay below 1280px. The header
// stays put while the body scrolls; `footer` pins below the body (a composer).
export function SidePanel({
  label,
  title,
  actions,
  onClose,
  closeLabel,
  width = "default",
  footer,
  bodyRef,
  children,
}: {
  /** Accessible name of the landmark. */
  label: string;
  title: ReactNode;
  /** Extra header controls, before the close button. */
  actions?: ReactNode;
  onClose: () => void;
  closeLabel: string;
  width?: "default" | "wide";
  footer?: ReactNode;
  bodyRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setSlot(document.getElementById("rail-slot")), []);
  if (!slot) return null;
  return createPortal(
    <aside className={s.panel} aria-label={label} data-width={width}>
      <div className={s.head}>
        <h2 className={s.title}>{title}</h2>
        <div className={s.actions}>
          {actions}
          <IconButton icon={X} size="sm" label={closeLabel} tooltip={false} onClick={onClose} />
        </div>
      </div>
      <div className={s.body} ref={bodyRef}>
        {children}
      </div>
      {footer && <div className={s.footer}>{footer}</div>}
    </aside>,
    slot,
  );
}
