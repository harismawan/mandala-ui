import { createContext, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import s from "./Dialog.module.css";

// The dialog's footer element, for content that owns its actions (a tab panel): <DialogFooter> renders into it.
const FooterSlot = createContext<HTMLElement | null>(null);

/** Actions rendered in the enclosing Dialog's footer (for panels whose buttons change with their state). */
export function DialogFooter({ children }: { children: ReactNode }) {
  const slot = useContext(FooterSlot);
  return slot ? createPortal(children, slot) : null;
}

// Native <dialog>: modal, focus trapped, Esc closes (reported through onClose), backdrop click closes too.
// `onSubmit` wraps the body in a form so Enter submits and the footer's submit button just works. A footer comes
// from `footer`, or from <DialogFooter> inside the content.
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  onSubmit,
  tone,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  children?: ReactNode;
  footer?: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  tone?: "danger";
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      const opener = document.activeElement;
      el.showModal();
      // The browser hands focus back to the opener on close(), not when an open dialog is unmounted (the usual
      // `{open && <Dialog open />}`): do it then, if the opener is still in the page.
      return () => {
        if (!el.isConnected && opener instanceof HTMLElement && opener.isConnected)
          opener.focus({ preventScroll: true });
      };
    }
    if (!open && el.open) el.close();
  }, [open]);
  const body = (
    <>
      <header className={s.header}>
        <h2 id={`${id}-t`} className={s.title}>
          {title}
        </h2>
        <IconButton icon={X} label="Close" size="sm" onClick={onClose} tooltip={false} />
      </header>
      {description && (
        <p id={`${id}-d`} className={s.description}>
          {description}
        </p>
      )}
      {children && (
        <div className={s.body}>
          <FooterSlot.Provider value={slot}>{children}</FooterSlot.Provider>
        </div>
      )}
      <footer ref={setSlot} className={s.footer}>
        {footer}
      </footer>
    </>
  );
  const dialog = (
    <dialog
      ref={ref}
      className={[s.dialog, className].filter(Boolean).join(" ")}
      data-size={size}
      data-tone={tone}
      aria-labelledby={`${id}-t`}
      aria-describedby={description ? `${id}-d` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      // Forms inside the dialog's content (a search box) bubble through React to the caller's form too.
      onSubmit={(e) => e.stopPropagation()}
    >
      {onSubmit ? (
        <form
          className={s.form}
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            // React bubbles submit through the component tree (portals included): a dialog opened inside a form,
            // such as the editor's, must not submit that form too.
            e.stopPropagation();
            onSubmit(e);
          }}
        >
          {body}
        </form>
      ) : (
        <div className={s.form}>{body}</div>
      )}
    </dialog>
  );
  // Never nested in the caller's DOM (a <form> inside the editor's <form> is invalid HTML). Server rendering has no
  // document to portal into: the closed dialog renders in place there.
  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
}
