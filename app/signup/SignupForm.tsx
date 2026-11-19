"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { submitKeepingValues } from "@/app/me/_components/submit";
import { LIMITS, type ActionState } from "@/app/me/_shared";
import { signupAction } from "@/lib/actions/account";

const initial: ActionState = {};

export default function SignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signupAction, initial);

  return (
    <form className="form" action={action} onSubmit={submitKeepingValues(action)}>
      <input type="hidden" name="next" value={next} />

      <div className="field">
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          required
          minLength={LIMITS.usernameMin}
          maxLength={LIMITS.usernameMax}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby="signup-username-hint"
        />
        <span className="hint" id="signup-username-hint">
          3 to 20 characters: lowercase letters, numbers and underscores. This is your public address.
        </span>
      </div>

      <div className="field">
        <label htmlFor="signup-display">Display name</label>
        <input
          id="signup-display"
          name="display_name"
          required
          maxLength={LIMITS.displayNameMax}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          maxLength={LIMITS.emailMax}
          autoComplete="email"
          aria-describedby="signup-email-hint"
        />
        <span className="hint" id="signup-email-hint">
          We send a link here to confirm your account. Never shown on your profile.
        </span>
      </div>

      <div className="field">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          required
          minLength={LIMITS.passwordMin}
          maxLength={LIMITS.passwordMax}
          autoComplete="new-password"
          aria-describedby="signup-password-hint"
        />
        <span className="hint" id="signup-password-hint">
          At least {LIMITS.passwordMin} characters.
        </span>
      </div>

      <FormMessage state={state} />

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Creating your account" : "Create account"}
        </button>
      </div>
    </form>
  );
}
