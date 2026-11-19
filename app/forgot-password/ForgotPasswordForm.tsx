"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { submitKeepingValues } from "@/app/me/_components/submit";
import { LIMITS, type ActionState } from "@/app/me/_shared";
import { PAUSED_NOTICE_ID } from "@/app/signup/_auth/MailPausedNotice";
import styles from "@/app/signup/_auth/auth.module.css";
import { requestPasswordResetAction } from "@/lib/actions/account";

const initial: ActionState = {};

export default function ForgotPasswordForm({ paused = false }: { paused?: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);

  return (
    <form
      className="form"
      action={action}
      onSubmit={submitKeepingValues(action)}
      aria-describedby={paused ? PAUSED_NOTICE_ID : undefined}
    >
      <fieldset className={styles.fieldset} disabled={paused}>
        <legend className="sr-only">Reset your password</legend>
        <div className="field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            inputMode="email"
            required
            maxLength={LIMITS.emailMax}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
        <FormMessage state={state} />
        <button type="submit" className={`btn btn-optic btn-lg ${styles.submit}`} disabled={pending || paused}>
          {paused ? "Resets paused" : pending ? "Sending" : "Send reset link"}
        </button>
      </fieldset>
    </form>
  );
}
