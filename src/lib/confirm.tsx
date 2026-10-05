import { useState, type ReactNode } from "react";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

// Confirmation dialog as a hook: `const [node, confirm] = useConfirmDialog("Delete"); confirm("Delete X?", act)`.
// Render `node` once; `confirm` opens the dialog and runs `action` on the verb button, showing its error inline.
export function useConfirmDialog(
  verb = "Delete",
): [ReactNode, (message: string, action: () => Promise<unknown>, opts?: { title?: string; danger?: boolean }) => void] {
  const [state, setState] = useState<{
    message: string;
    action: () => Promise<unknown>;
    title: string;
    danger: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    if (busy) return;
    setState(null);
    setError(null);
  };
  const run = async () => {
    if (!state) return;
    setBusy(true);
    setError(null);
    try {
      await state.action();
      setState(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const node = (
    <Dialog
      open={!!state}
      onClose={close}
      title={state?.title ?? `${verb}?`}
      tone={state?.danger ? "danger" : undefined}
      size="sm"
      footer={
        <>
          <Button variant="subtle" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button variant={state?.danger ? "danger" : "primary"} loading={busy} onClick={run}>
            {verb}
          </Button>
        </>
      }
    >
      <p>{state?.message}</p>
      {error && (
        <p role="alert" style={{ color: "var(--danger-text)", marginTop: "var(--space-2)" }}>
          {error}
        </p>
      )}
    </Dialog>
  );
  const confirm = (message: string, action: () => Promise<unknown>, opts?: { title?: string; danger?: boolean }) =>
    setState({ message, action, title: opts?.title ?? `${verb}?`, danger: opts?.danger ?? verb === "Delete" });
  return [node, confirm];
}
