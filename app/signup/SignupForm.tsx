"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/app/me/_components/FormMessage";
import { submitKeepingValues } from "@/app/me/_components/submit";
import { LIMITS, USERNAME_PATTERN, type ActionState } from "@/app/me/_shared";
import { signupAction } from "@/lib/actions/account";
import { PAUSED_NOTICE_ID } from "./_auth/MailPausedNotice";
import PasswordField from "./_auth/PasswordField";
import styles from "./_auth/auth.module.css";

const initial: ActionState = {};

export default function SignupForm({ next, paused = false }: { next: string; paused?: boolean }) {
  const [state, action, pending] = useActionState(signupAction, initial);
  const [handle, setHandle] = useState("");
  const preview = handle.trim().toLowerCase();

  return (
    <form
      className="form"
      action={action}
      onSubmit={submitKeepingValues(action)}
      aria-describedby={paused ? PAUSED_NOTICE_ID : undefined}
    >
      <input type="hidden" name="next" value={next} />

      {/* A disabled fieldset switches every field off while email is not set up. */}
      <fieldset className={styles.fieldset} disabled={paused}>
        <legend className="sr-only">Your new account</legend>

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
            onInput={(event) => setHandle(event.currentTarget.value)}
          />
          <span className="hint" id="signup-username-hint">
            3 to 20 characters: lowercase letters, numbers and underscores. This is your public address.
          </span>
          {USERNAME_PATTERN.test(preview) && (
            <span className={styles.handle}>
              Your page: <code>/u/{preview}</code>
            </span>
          )}
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
            inputMode="email"
            required
            maxLength={LIMITS.emailMax}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby="signup-email-hint"
          />
          <span className="hint" id="signup-email-hint">
            We send a link here to confirm your account. Never shown on your profile.
          </span>
        </div>

        <PasswordField
          id="signup-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={LIMITS.passwordMin}
          maxLength={LIMITS.passwordMax}
          hint={`At least ${LIMITS.passwordMin} characters.`}
        />

        <FormMessage state={state} />

        <button type="submit" className={`btn btn-optic btn-lg ${styles.submit}`} disabled={pending || paused}>
          {paused ? "Sign-ups paused" : pending ? "Creating your account" : "Create account"}
        </button>
      </fieldset>
    </form>
  );
}
