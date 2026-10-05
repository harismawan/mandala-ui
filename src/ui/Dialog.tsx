import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import s from "./Dialog.module.css";

// Native <dialog>: modal, focus trapped, Esc closes (reported through onClose), backdrop click closes too.
// `onSubmit` wraps the body in a form so Enter submits and the footer's submit button just works.
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
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  footer?: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  tone?: "danger";
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
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
      {children && <div className={s.body}>{children}</div>}
      {footer && <footer className={s.footer}>{footer}</footer>}
    </>
  );
  return (
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
    >
      {onSubmit ? (
        <form
          className={s.form}
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
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
}
