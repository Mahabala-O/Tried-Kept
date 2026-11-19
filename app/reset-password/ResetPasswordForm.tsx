"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { LIMITS, type ActionState } from "@/app/me/_shared";
import { resetPasswordAction } from "@/lib/actions/account";

const initial: ActionState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form className="form" action={action}>
      <input type="hidden" name="token" value={token} />
      <div className="field">
        <label htmlFor="reset-password">New password</label>
        <input
          id="reset-password"
          name="password"
          type="password"
          required
          minLength={LIMITS.passwordMin}
          maxLength={LIMITS.passwordMax}
          autoComplete="new-password"
          aria-describedby="reset-password-hint"
        />
        <span className="hint" id="reset-password-hint">
          At least {LIMITS.passwordMin} characters. Every device will be logged out.
        </span>
      </div>
      <FormMessage state={state} />
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving" : "Save new password"}
        </button>
      </div>
    </form>
  );
}
