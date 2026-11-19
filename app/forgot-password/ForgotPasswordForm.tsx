"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { submitKeepingValues } from "@/app/me/_components/submit";
import { LIMITS, type ActionState } from "@/app/me/_shared";
import { requestPasswordResetAction } from "@/lib/actions/account";

const initial: ActionState = {};

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);

  return (
    <form className="form" action={action} onSubmit={submitKeepingValues(action)}>
      <div className="field">
        <label htmlFor="forgot-email">Email</label>
        <input id="forgot-email" name="email" type="email" required maxLength={LIMITS.emailMax} autoComplete="email" />
      </div>
      <FormMessage state={state} />
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending" : "Send reset link"}
        </button>
      </div>
    </form>
  );
}
