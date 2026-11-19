import type { ActionState } from "../_shared";

/** Keeps a live region mounted so screen readers announce each result. */
export function FormMessage({ state }: { state: ActionState }) {
  return (
    <div role="status" aria-live="polite">
      {state.error && <p className="form-error">{state.error}</p>}
      {state.ok && <p className="form-ok">{state.ok}</p>}
    </div>
  );
}
