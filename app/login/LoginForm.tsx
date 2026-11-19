"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { submitKeepingValues } from "@/app/me/_components/submit";
import type { ActionState } from "@/app/me/_shared";
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

      <div className="field">
        <label htmlFor="login-password">Password</label>
        <input id="login-password" name="password" type="password" required autoComplete="current-password" />
      </div>

      <FormMessage state={state} />

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Logging in" : "Log in"}
        </button>
      </div>
    </form>
  );
}
