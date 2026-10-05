import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import s from "./Field.module.css";

type FieldChrome = { label: ReactNode; help?: ReactNode; error?: ReactNode; hideLabel?: boolean; className?: string };

function Chrome({
  id,
  label,
  help,
  error,
  hideLabel,
  className,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className={[s.field, className].filter(Boolean).join(" ")} data-invalid={error ? true : undefined}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : s.label}>
        {label}
      </label>
      {children}
      {error ? (
        <div id={`${id}-err`} className={s.error} role="alert">
          {error}
        </div>
      ) : (
        help && (
          <div id={`${id}-help`} className={s.help}>
            {help}
          </div>
        )
      )}
    </div>
  );
}

const describedBy = (id: string, help?: ReactNode, error?: ReactNode) =>
  error ? `${id}-err` : help ? `${id}-help` : undefined;

export const TextField = forwardRef<HTMLInputElement, FieldChrome & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, help, error, hideLabel, className, id: given, ...rest }, ref) {
    const auto = useId();
    const id = given ?? auto;
    return (
      <Chrome id={id} label={label} help={help} error={error} hideLabel={hideLabel} className={className}>
        <input
          ref={ref}
          id={id}
          className={s.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          {...rest}
        />
      </Chrome>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, FieldChrome & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ label, help, error, hideLabel, className, id: given, ...rest }, ref) {
    const auto = useId();
    const id = given ?? auto;
    return (
      <Chrome id={id} label={label} help={help} error={error} hideLabel={hideLabel} className={className}>
        <textarea
          ref={ref}
          id={id}
          className={s.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          {...rest}
        />
      </Chrome>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, FieldChrome & SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ label, help, error, hideLabel, className, id: given, children, ...rest }, ref) {
    const auto = useId();
    const id = given ?? auto;
    return (
      <Chrome id={id} label={label} help={help} error={error} hideLabel={hideLabel} className={className}>
        <select
          ref={ref}
          id={id}
          className={s.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, help, error)}
          {...rest}
        >
          {children}
        </select>
      </Chrome>
    );
  },
);

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: { label: ReactNode; description?: ReactNode; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <label htmlFor={id} className={[s.check, className].filter(Boolean).join(" ")}>
      <input id={id} type="checkbox" {...rest} />
      <span>
        <span>{label}</span>
        {description && <span className={s.help}>{description}</span>}
      </span>
    </label>
  );
}
