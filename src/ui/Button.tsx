import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type LucideIcon } from "./Icon";
import { Spinner } from "./Spinner";
import s from "./Button.module.css";

export type ButtonVariant = "primary" | "brand" | "default" | "subtle" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
  loading?: boolean;
  pressed?: boolean;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "md", icon, iconAfter, loading, pressed, className, children, disabled, type, ...rest },
  ref,
) {
  const iconSize = size === "sm" ? 14 : 16;
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={[s.button, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner size={iconSize} /> : icon && <Icon icon={icon} size={iconSize} />}
      {children && <span className={s.label}>{children}</span>}
      {iconAfter && <Icon icon={iconAfter} size={iconSize} />}
    </button>
  );
});

// Icon-only button: the label is the accessible name and the tooltip.
const ICON: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 24 };
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "icon" | "children"> & { icon: LucideIcon; label: string; tooltip?: boolean }
>(function IconButton({ icon, label, size = "md", tooltip = true, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={rest.type ?? "button"}
      className={[s.button, s.iconOnly, className].filter(Boolean).join(" ")}
      data-variant={rest.variant ?? "subtle"}
      data-size={size}
      data-tooltip={tooltip ? label : undefined}
      aria-label={label}
      aria-pressed={rest.pressed}
      aria-busy={rest.loading || undefined}
      disabled={rest.disabled || rest.loading}
      {...stripButtonProps(rest)}
    >
      {rest.loading ? <Spinner size={ICON[size] - 4} /> : <Icon icon={icon} size={ICON[size]} />}
    </button>
  );
});

function stripButtonProps<T extends Partial<ButtonProps>>(p: T) {
  const { variant: _v, loading: _l, pressed: _p, iconAfter: _a, type: _t, disabled: _d, ...rest } = p;
  return rest;
}
