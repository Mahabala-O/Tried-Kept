"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { submitKeepingValues } from "@/app/me/_components/submit";
import type { ActionState } from "@/app/me/_shared";
import PasswordField from "@/app/signup/_auth/PasswordField";
import styles from "@/app/signup/_auth/auth.module.css";
import { loginAction } from "@/lib/actions/account";

const initial: ActionState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form className="form" action={action} onSubmit={submitKeepingValues(action)}>
      <input type="hidden" name="next" value={next} />

      <div className="field">
        <label htmlFor="login-identifier">Email or username</label>
        <input
          id="login-identifier"
          name="identifier"
          required
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <PasswordField id="login-password" name="password" label="Password" autoComplete="current-password" />

      <FormMessage state={state} />

      <button type="submit" className={`btn btn-optic btn-lg ${styles.submit}`} disabled={pending}>
        {pending ? "Logging in" : "Log in"}
      </button>
    </form>
  );
}
