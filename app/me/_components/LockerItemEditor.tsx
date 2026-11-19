"use client";

import { useActionState, useId, useState } from "react";
import { removeLockerItemAction, updateLockerItemAction } from "@/lib/actions/locker";
import type { LockerRow } from "../_data";
import { LIMITS, LOCKER_STATUSES, type ActionState } from "../_shared";
import { FormMessage } from "./FormMessage";
import { submitKeepingValues } from "./submit";

const initial: ActionState = {};

export default function LockerItemEditor({ item, label }: { item: LockerRow; label: string }) {
  const [saveState, saveAction, saving] = useActionState(updateLockerItemAction, initial);
  const [removeState, removeAction, removing] = useActionState(removeLockerItemAction, initial);
  const [confirming, setConfirming] = useState(false);
  const id = useId();

  return (
    <details>
      <summary className="btn" aria-label={`Edit details for ${label}`}>
        Edit details
      </summary>

      <div className="stack" style={{ marginTop: 12 }}>
        <form className="form" action={saveAction} onSubmit={submitKeepingValues(saveAction)}>
          <input type="hidden" name="item_id" value={item.id} />

          <div className="field">
            <label htmlFor={`${id}-status`}>Status (public)</label>
            <select id={`${id}-status`} name="status" defaultValue={item.status}>
              {LOCKER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor={`${id}-size`}>Size (public)</label>
            <input id={`${id}-size`} name="size" maxLength={LIMITS.sizeMax} defaultValue={item.size} />
          </div>

          <div className="field">
            <label htmlFor={`${id}-width`}>Width (public)</label>
            <input id={`${id}-width`} name="width" maxLength={LIMITS.widthMax} defaultValue={item.width} />
          </div>

          <div className="field">
            <label htmlFor={`${id}-hours`}>Hours played (public)</label>
            <input
              id={`${id}-hours`}
              name="hours"
              type="number"
              inputMode="decimal"
              min={0}
              max={LIMITS.hoursMax}
              step="any"
              defaultValue={item.hours ?? ""}
            />
          </div>

          <div className="field">
            <label htmlFor={`${id}-price`}>Price paid in USD (private)</label>
            <input
              id={`${id}-price`}
              name="price_paid"
              type="number"
              inputMode="decimal"
              min={0}
              max={LIMITS.priceMax}
              step="any"
              defaultValue={item.price_paid ?? ""}
            />
          </div>

          <div className="field">
            <label htmlFor={`${id}-notes`}>Notes (private)</label>
            <textarea id={`${id}-notes`} name="notes" maxLength={LIMITS.notesMax} defaultValue={item.notes} />
          </div>

          <FormMessage state={saveState} />

          <div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving" : "Save changes"}
            </button>
          </div>
        </form>

        {confirming ? (
          <form className="stack" action={removeAction}>
            <input type="hidden" name="item_id" value={item.id} />
            <p className="small">Remove {label} from your locker? Its size, hours, price and notes will be deleted.</p>
            <div className="row">
              <button type="submit" className="btn btn-shop" disabled={removing}>
                {removing ? "Removing" : "Yes, remove"}
              </button>
              <button type="button" className="btn" onClick={() => setConfirming(false)}>
                Keep it
              </button>
            </div>
          </form>
        ) : (
          <div>
            <button type="button" className="btn" onClick={() => setConfirming(true)}>
              Remove from locker
            </button>
          </div>
        )}
        <FormMessage state={removeState} />
      </div>
    </details>
  );
}
