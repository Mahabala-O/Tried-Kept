"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { addToLockerAction } from "@/lib/actions/locker";
import { LOCKER_STATUSES, type ActionState, type LockerStatus } from "../_shared";
import { FormMessage } from "./FormMessage";
import { submitKeepingValues } from "./submit";

const initial: ActionState = {};

export default function AddToLockerForm({
  productSlug,
  currentStatus,
}: {
  productSlug: string;
  currentStatus: LockerStatus | null;
}) {
  const [state, action, pending] = useActionState(addToLockerAction, initial);
  const statusId = useId();

  return (
    <form className="stack" action={action} onSubmit={submitKeepingValues(action)}>
      <input type="hidden" name="product_slug" value={productSlug} />
      <div className="field">
        <label htmlFor={statusId}>Status</label>
        <select id={statusId} name="status" defaultValue={currentStatus ?? "using"}>
          {LOCKER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving" : currentStatus ? "Update locker" : "Add to locker"}
        </button>
        {currentStatus && (
          <Link href="/me" className="tap-link">
            View my locker
          </Link>
        )}
      </div>
      <FormMessage state={state} />
    </form>
  );
}
