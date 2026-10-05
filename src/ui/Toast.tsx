import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { IconButton } from "./Button";
import { Icon } from "./Icon";
import s from "./Toast.module.css";

export type ToastTone = "success" | "error" | "info";
export type ToastItem = { id: number; tone: ToastTone; title: string; body?: ReactNode; action?: ReactNode };

type Listener = (items: ToastItem[]) => void;
let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<Listener>();
const emit = () => {
  for (const l of listeners) l(items);
};

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function push(tone: ToastTone, title: string, opts?: { body?: ReactNode; action?: ReactNode; duration?: number }) {
  const id = ++seq;
  items = [...items, { id, tone, title, body: opts?.body, action: opts?.action }];
  emit();
  const duration = opts?.duration ?? (tone === "error" ? 8000 : 5000);
  if (duration > 0) setTimeout(() => dismissToast(id), duration);
  return id;
}

// Module-level API so mutations and route code can report without threading a context through.
export const toast = {
  success: (title: string, opts?: Parameters<typeof push>[2]) => push("success", title, opts),
  error: (title: string, opts?: Parameters<typeof push>[2]) => push("error", title, opts),
  info: (title: string, opts?: Parameters<typeof push>[2]) => push("info", title, opts),
};

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastHost() {
  const [list, setList] = useState(items);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  if (!list.length) return null;
  return (
    <div className={s.host}>
      {list.map((t) => (
        <div key={t.id} className={s.toast} data-tone={t.tone} role={t.tone === "error" ? "alert" : "status"}>
          <Icon icon={ICONS[t.tone]} size={20} className={s.icon} />
          <div className={s.text}>
            <div className={s.title}>{t.title}</div>
            {t.body && <div className={s.body}>{t.body}</div>}
            {t.action && <div className={s.action}>{t.action}</div>}
          </div>
          <IconButton icon={X} label="Dismiss" size="sm" tooltip={false} onClick={() => dismissToast(t.id)} />
        </div>
      ))}
    </div>
  );
}
