import { useState, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Logo, type Product } from "../brand/Logo";
import { IconButton } from "./Button";
import { Icon } from "./Icon";
import s from "./Auth.module.css";

// Split sign-in screen shared by both products: brand panel on the left, one card on the right. The panel folds
// away below 900px and the card shows the logo instead.
export function AuthLayout({
  product,
  tagline,
  subtitle,
  title,
  children,
}: {
  product: Product;
  tagline: string;
  subtitle?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className={s.page}>
      <aside className={s.panel} aria-hidden="true">
        <Logo product={product} size={36} inverse />
        <p className={s.tagline}>{tagline}</p>
        {subtitle && <p className={s.sub}>{subtitle}</p>}
      </aside>
      <section className={s.side}>
        <div className={s.card}>
          <div className={s.cardLogo}>
            <Logo product={product} size={28} />
          </div>
          <h1 className={s.title}>{title}</h1>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthForm({ children, ...rest }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={s.form} {...rest}>
      {children}
    </form>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p className={s.error} role="alert">
      <Icon icon={AlertCircle} size={16} />
      <span>{children}</span>
    </p>
  );
}

export function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={s.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function PasswordField({
  name = "password",
  label = "Password",
  autoFocus,
}: {
  name?: string;
  label?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <AuthField label={label}>
      <span className={s.passwordWrap}>
        <input
          name={name}
          type={show ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus={autoFocus}
        />
        <IconButton
          icon={show ? EyeOff : Eye}
          label={show ? "Hide password" : "Show password"}
          size="sm"
          tooltip={false}
          className={s.eye}
          onClick={() => setShow(!show)}
        />
      </span>
    </AuthField>
  );
}

export const authSubmitClass = s.submit;
