"use client";

import { useActionState } from "react";
import { changePasswordAction, deleteAccountAction, logoutOtherDevicesAction } from "@/lib/actions/account";
import { LIMITS, type ActionState } from "../_shared";
import { FormMessage } from "./FormMessage";

const initial: ActionState = {};

export default function AccountSettings() {
  const [passwordState, passwordAction, savingPassword] = useActionState(changePasswordAction, initial);
  const [devicesState, devicesAction, endingSessions] = useActionState(logoutOtherDevicesAction, initial);
  const [deleteState, deleteAction, deleting] = useActionState(deleteAccountAction, initial);

  return (
    <div className="stack-lg">
      <form className="form" action={passwordAction}>
        <h3>Change password</h3>
        <div className="field">
          <label htmlFor="account-current">Current password</label>
          <input id="account-current" name="current_password" type="password" required autoComplete="current-password" />
        </div>
        <div className="field">
          <label htmlFor="account-new">New password</label>
          <input
            id="account-new"
            name="new_password"
            type="password"
            required
            minLength={LIMITS.passwordMin}
            maxLength={LIMITS.passwordMax}
            autoComplete="new-password"
            aria-describedby="account-new-hint"
          />
          <span className="hint" id="account-new-hint">
            At least {LIMITS.passwordMin} characters. Other devices will be logged out.
          </span>
        </div>
        <FormMessage state={passwordState} />
        <div>
          <button type="submit" className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? "Saving" : "Change password"}
          </button>
        </div>
      </form>

      <form className="stack" action={devicesAction}>
        <h3>Other devices</h3>
        <p className="small muted">Log out everywhere except this device.</p>
        <FormMessage state={devicesState} />
        <div>
          <button type="submit" className="btn" disabled={endingSessions}>
            {endingSessions ? "Logging out" : "Log out other devices"}
          </button>
        </div>
      </form>

      <details>
        <summary className="btn">Delete my account</summary>
        <form className="form" action={deleteAction} style={{ marginTop: 12 }}>
          <p className="small">
            This permanently deletes your profile, locker, reports, votes and XP. It cannot be undone.
          </p>
          <div className="field">
            <label htmlFor="account-delete-password">Enter your password to confirm</label>
            <input id="account-delete-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <FormMessage state={deleteState} />
          <div>
            <button type="submit" className="btn btn-shop" disabled={deleting}>
              {deleting ? "Deleting" : "Delete my account for good"}
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
