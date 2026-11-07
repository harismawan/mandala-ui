import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { Icon } from "./Icon";
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

/**
 * Label, help and error around a control the field primitives do not cover (pickers, swatches). The control takes
 * `id` and should point `aria-describedby` at `fieldNoteId(id)` when there is help or an error.
 */
export function FieldShell(props: FieldChrome & { id: string; children: ReactNode }) {
  return <Chrome {...props} />;
}
export const fieldNoteId = (id: string, help?: ReactNode, error?: ReactNode) => describedBy(id, help, error);

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
        {/* The browser's own arrow sits wherever each engine puts it, flush against the border in some; draw ours. */}
        <span className={s.selectWrap}>
          <select
            ref={ref}
            id={id}
            className={[s.input, s.select].join(" ")}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, help, error)}
            {...rest}
          >
            {children}
          </select>
          <Icon icon={ChevronDown} size={16} className={s.chevron} />
        </span>
      </Chrome>
    );
  },
);

type ChoiceProps = {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  hideLabel?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** `hideLabel` keeps the label for assistive technology only (a table's row selection). */
export function Checkbox(props: ChoiceProps) {
  return <Choice type="checkbox" {...props} />;
}

/** One option of a radio group: give the group's options one `name` and put them in a ChoiceGroup. */
export function Radio(props: ChoiceProps) {
  return <Choice type="radio" {...props} />;
}

/** A fieldset of Checkbox or Radio options under a legend drawn like a field label. `nested` indents a group of
 *  sub-options under the option they belong to; `hideLegend` keeps its legend for assistive technology only. */
export function ChoiceGroup({
  legend,
  help,
  disabled,
  nested,
  hideLegend,
  className,
  children,
}: {
  legend: ReactNode;
  help?: ReactNode;
  disabled?: boolean;
  nested?: boolean;
  hideLegend?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      className={[s.choices, className].filter(Boolean).join(" ")}
      disabled={disabled}
      data-nested={nested || undefined}
    >
      <legend className={hideLegend ? "sr-only" : s.label}>{legend}</legend>
      {help && <div className={s.help}>{help}</div>}
      {children}
    </fieldset>
  );
}

function Choice({ type, label, description, className, hideLabel, ...rest }: ChoiceProps & { type: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={[s.check, className].filter(Boolean).join(" ")}>
      <input id={id} type={type} {...rest} />
      <span className={hideLabel ? "sr-only" : undefined}>
        <span>{label}</span>
        {description && <span className={s.help}>{description}</span>}
      </span>
    </label>
  );
}
