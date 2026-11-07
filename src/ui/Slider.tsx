import { useId, type ReactNode } from "react";
import { FieldShell, fieldNoteId } from "./Field";
import s from "./Slider.module.css";

// Range input with the field chrome (label, help). Native <input type="range">: keyboard, touch and screen readers
// for free; only its colour comes from the tokens.
export function Slider({
  label,
  help,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueText,
}: {
  label: ReactNode;
  help?: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Spoken value (aria-valuetext), e.g. "150%". */
  valueText?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help}>
      <input
        id={id}
        type="range"
        className={s.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        aria-describedby={fieldNoteId(id, help)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </FieldShell>
  );
}
