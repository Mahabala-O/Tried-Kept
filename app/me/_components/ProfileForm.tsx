"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/account";
import { LIMITS, PLAY_LEVELS, SURFACES, type ActionState } from "../_shared";
import { FormMessage } from "./FormMessage";
import { submitKeepingValues } from "./submit";

const initial: ActionState = {};

export type ProfileValues = {
  displayName: string;
  bio: string;
  homeSurface: string;
  playLevel: string;
  weeklyHours: number | null;
};

export default function ProfileForm({ values }: { values: ProfileValues }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form className="form" action={action} onSubmit={submitKeepingValues(action)}>
      <div className="field">
        <label htmlFor="profile-display">Display name (public)</label>
        <input
          id="profile-display"
          name="display_name"
          required
          maxLength={LIMITS.displayNameMax}
          defaultValue={values.displayName}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <label htmlFor="profile-bio">Bio</label>
        <textarea
          id="profile-bio"
          name="bio"
          maxLength={LIMITS.bioMax}
          defaultValue={values.bio}
          aria-describedby="profile-bio-hint"
        />
        <span className="hint" id="profile-bio-hint">
          Up to {LIMITS.bioMax} characters. Shown on your public profile.
        </span>
      </div>

      <div className="field">
        <label htmlFor="profile-surface">Home surface (public)</label>
        <select id="profile-surface" name="home_surface" defaultValue={values.homeSurface}>
          <option value="">Not set</option>
          {SURFACES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="profile-level">Play level (public)</label>
        <select id="profile-level" name="play_level" defaultValue={values.playLevel}>
          <option value="">Not set</option>
          {PLAY_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="profile-hours">Hours played per week (private)</label>
        <input
          id="profile-hours"
          name="weekly_hours"
          type="number"
          inputMode="decimal"
          min={0}
          max={LIMITS.weeklyHoursMax}
          step="any"
          defaultValue={values.weeklyHours ?? ""}
          aria-describedby="profile-hours-hint"
        />
        <span className="hint" id="profile-hours-hint">
          From 0 to {LIMITS.weeklyHoursMax}.
        </span>
      </div>

      <FormMessage state={state} />

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
