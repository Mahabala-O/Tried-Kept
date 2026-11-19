"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { LIMITS, type ActionState } from "@/app/me/_shared";
import PasswordField from "@/app/signup/_auth/PasswordField";
import styles from "@/app/signup/_auth/auth.module.css";
import { resetPasswordAction } from "@/lib/actions/account";

const initial: ActionState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form className="form" action={action}>
      <input type="hidden" name="token" value={token} />
      <PasswordField
        id="reset-password"
        name="password"
        label="New password"
        autoComplete="new-password"
        minLength={LIMITS.passwordMin}
        maxLength={LIMITS.passwordMax}
        hint={`At least ${LIMITS.passwordMin} characters. Every device will be logged out.`}
      />
      <FormMessage state={state} />
      <button type="submit" className={`btn btn-optic btn-lg ${styles.submit}`} disabled={pending}>
        {pending ? "Saving" : "Save new password"}
      </button>
    </form>
  );
}
