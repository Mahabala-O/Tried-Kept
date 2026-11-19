"use client";

import { useState } from "react";
import styles from "./auth.module.css";

/** A password input with a Show button, so people can check what they typed on a phone keyboard. */
export default function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  maxLength,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: "new-password" | "current-password";
  minLength?: number;
  maxLength?: number;
  hint?: string;
}) {
  const [shown, setShown] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          required
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={hintId}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-controls={id}
          aria-pressed={shown}
          onClick={() => setShown((value) => !value)}
        >
          {shown ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </div>
      {hint && (
        <span className="hint" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
}
