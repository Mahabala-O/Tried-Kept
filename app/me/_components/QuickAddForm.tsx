"use client";

import { useActionState, useId } from "react";
import { addToLockerAction } from "@/lib/actions/locker";
import { LOCKER_STATUSES, type ActionState } from "../_shared";
import { FormMessage } from "./FormMessage";
import { submitKeepingValues } from "./submit";

export type QuickAddGroup = { label: string; options: { slug: string; label: string }[] };

const initial: ActionState = {};

/** The own-gear entry point: pick a model you already have, straight from the locker. */
export default function QuickAddForm({ groups }: { groups: QuickAddGroup[] }) {
  const [state, action, pending] = useActionState(addToLockerAction, initial);
  const modelId = useId();
  const statusId = useId();

  return (
    <form className="form" action={action} onSubmit={submitKeepingValues(action)}>
      <div className="field">
        <label htmlFor={modelId}>Model</label>
        <select id={modelId} name="product_slug" required defaultValue="">
          {/* Left enabled so the form returns here once the chosen model leaves the list. */}
          <option value="">Choose a model</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={statusId}>Status</label>
        <select id={statusId} name="status" defaultValue="using">
          {LOCKER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <FormMessage state={state} />
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Adding" : "Add to locker"}
        </button>
      </div>
    </form>
  );
}
