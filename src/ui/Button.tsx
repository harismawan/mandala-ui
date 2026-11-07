import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
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
  // A step below IconButton's 16/20: beside a text label the icon sits at the text's scale, not the
  // icon-only button's.
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

/** A link drawn as a Button (downloads, other pages): one focusable `<a>`, never a button inside a link. */
export const ButtonLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: LucideIcon;
    iconAfter?: LucideIcon;
    disabled?: boolean;
  }
>(function ButtonLink(
  { variant = "default", size = "md", icon, iconAfter, disabled, className, children, href, onClick, ...rest },
  ref,
) {
  const iconSize = size === "sm" ? 14 : 16;
  return (
    <a
      ref={ref}
      href={disabled ? undefined : href}
      className={[s.button, s.link, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      aria-disabled={disabled || undefined}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {icon && <Icon icon={icon} size={iconSize} />}
      {children && <span className={s.label}>{children}</span>}
      {iconAfter && <Icon icon={iconAfter} size={iconSize} />}
    </a>
  );
});

// Icon-only button: the label is the accessible name and the tooltip.
const ICON = { sm: 16, md: 20, lg: 24 } as const;
const SPIN = { sm: 14, md: 16, lg: 24 } as const;
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
      {rest.loading ? (
        <Spinner size={SPIN[size]} />
      ) : (
        <Icon icon={icon} size={ICON[size]} {...(size === "lg" ? { strokeWidth: 1.75 } : {})} />
      )}
    </button>
  );
});

function stripButtonProps<T extends Partial<ButtonProps>>(p: T) {
  const { variant: _v, loading: _l, pressed: _p, iconAfter: _a, type: _t, disabled: _d, ...rest } = p;
  return rest;
}
