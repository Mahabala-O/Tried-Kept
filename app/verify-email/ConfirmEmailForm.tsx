"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import type { ActionState } from "@/app/me/_shared";
import { confirmEmailAction } from "@/lib/actions/account";

const initial: ActionState = {};

/** A button rather than an automatic step, because mail scanners open links on their own. */
export default function ConfirmEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmEmailAction, initial);

  return (
    <form className="form" action={action}>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Confirming" : "Confirm and log in"}
        </button>
      </div>
    </form>
  );
}
