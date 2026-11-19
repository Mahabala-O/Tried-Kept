"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  LIMITS,
  PLAY_LEVELS,
  RESERVED_USERNAMES,
  SURFACES,
  USERNAME_PATTERN,
  cleanDisplayName,
  cleanText,
  displayNameError,
  formText,
  parseOptionalNumber,
  safeNext,
  type ActionState,
} from "@/app/me/_shared";
import {
  HashingBusyError,
  createSession,
  destroyAllSessions,
  destroyOtherSessions,
  destroySession,
  dummyPasswordHash,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import { XP, awardXp } from "@/lib/gamification";
import { appUrl, mailReady, sendMail } from "@/lib/mail";
import { clientIp } from "@/lib/request-ip";
import {
  admitLogin,
  allowMailTo,
  allowReauth,
  allowResetRequest,
  allowSignup,
  loginDelayMs,
  loginSubject,
  pruneLimits,
  recordLoginFailure,
  recordLoginSuccess,
  reserveLoginPair,
} from "@/lib/throttle";
import { consumeToken, issueToken, tokenIsLive } from "@/lib/tokens";

const LOGIN_FAILED = "That login did not work. Check your details and try again.";
const LOGIN_THROTTLED = "Too many attempts. Wait a few minutes and try again.";
const SITE_BUSY = "We are getting a lot of login traffic. Wait a few minutes and try again.";
const USERNAME_TAKEN = "That username is taken. Try another one.";
const MAIL_OFF = "Email is not set up on this site yet, so we cannot confirm accounts or reset passwords.";
const LINK_DEAD = "This link has expired or was already used.";
const WRONG_PASSWORD = "That password is not right.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordError(password: string): string | null {
  if (password.length < LIMITS.passwordMin) return `Use a password of at least ${LIMITS.passwordMin} characters.`;
  if (password.length > LIMITS.passwordMax) return `Use a password of ${LIMITS.passwordMax} characters or fewer.`;
  return null;
}

/** Turns "too many hashes queued" into a null the caller can answer with a retry message. */
function nullIfBusy(error: unknown): null {
  if (error instanceof HashingBusyError) return null;
  throw error;
}

type Db = ReturnType<typeof getDb>;

function sendVerification(db: Db, userId: number, email: string, nextPath: string): void {
  if (!allowMailTo(db, email)) return;
  const token = issueToken(db, userId, "verify", nextPath);
  sendMail({
    to: email,
    subject: "Confirm your Tried & Kept account",
    text: `Confirm your email to finish joining Tried & Kept:\n\n${appUrl(`/verify-email?token=${token}`)}\n\nThis link works for 24 hours. If you did not sign up, you can ignore this message.`,
  });
}

/* Accounts --------------------------------------------------------------- */

export async function signupAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const username = formText(data, "username").trim().toLowerCase();
  const displayName = cleanDisplayName(formText(data, "display_name"));
  const email = formText(data, "email").trim().toLowerCase();
  const password = formText(data, "password");
  const next = safeNext(formText(data, "next"));

  if (!USERNAME_PATTERN.test(username)) {
    return { error: "Usernames are 3 to 20 characters: lowercase letters, numbers and underscores." };
  }
  if (RESERVED_USERNAMES.has(username)) return { error: "That username is reserved. Try another one." };
  const nameProblem = displayNameError(displayName);
  if (nameProblem) return { error: nameProblem };
  if (email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
  const passwordProblem = passwordError(password);
  if (passwordProblem) return { error: passwordProblem };
  if (!mailReady()) return { error: MAIL_OFF };

  const db = getDb();
  const now = Date.now();
  pruneLimits(db, now);
  // A signup nobody confirmed should not hold a username or an email forever.
  db.prepare("DELETE FROM users WHERE email_verified_at IS NULL AND created_at < datetime('now', '-2 days')").run();

  const holder = db.prepare("SELECT email, email_verified_at FROM users WHERE username = ?").get(username) as
    | { email: string; email_verified_at: string | null }
    | undefined;
  if (holder && (holder.email_verified_at !== null || holder.email !== email)) return { error: USERNAME_TAKEN };

  if (!allowSignup(db, await clientIp(), now)) {
    return { error: "Too many new accounts from this connection. Try again in an hour." };
  }

  // Hashed on every path, so a registered email takes as long as a new one.
  const passwordHash = await hashPassword(password).catch(nullIfBusy);
  if (passwordHash === null) return { error: SITE_BUSY };

  const existing = db.prepare("SELECT id, email_verified_at FROM users WHERE email = ?").get(email) as
    | { id: number; email_verified_at: string | null }
    | undefined;

  if (existing?.email_verified_at) {
    if (allowMailTo(db, email)) {
      sendMail({
        to: email,
        subject: "Someone tried to join Tried & Kept with your email",
        text: `This address already has a Tried & Kept account. If this was you, log in or reset your password:\n\n${appUrl("/forgot-password")}\n\nIf it was not you, you can ignore this message.`,
      });
    }
  } else {
    // Nobody proved they own this address yet, so the newest signup replaces the old one.
    if (existing) db.prepare("DELETE FROM users WHERE id = ?").run(existing.id);
    try {
      const result = db
        .prepare("INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)")
        .run(username, email, passwordHash, displayName);
      sendVerification(db, Number(result.lastInsertRowid), email, next);
    } catch (error) {
      // Two signups can race past the checks above. The unique index settles it.
      const message = error instanceof Error ? error.message : "";
      if (message.includes("users.username")) return { error: USERNAME_TAKEN };
      if (!message.includes("users.email")) throw error;
    }
  }

  // The same answer for a new and a registered email. The next step arrives by email.
  redirect("/check-email");
}

export async function confirmEmailAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const db = getDb();
  const used = consumeToken(db, formText(data, "token"), "verify");
  if (!used) return { error: `${LINK_DEAD} Log in to get a new one.` };

  db.prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, datetime('now')) WHERE id = ?").run(
    used.userId,
  );
  awardXp(db, used.userId, "signup", XP.signup);
  await createSession(used.userId);
  revalidatePath("/", "layout");
  redirect(safeNext(used.nextPath));
}

export async function loginAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const identifier = formText(data, "identifier").trim().toLowerCase();
  const password = formText(data, "password");
  const next = safeNext(formText(data, "next"));

  if (!identifier || !password) return { error: LOGIN_FAILED };

  const db = getDb();
  const ip = await clientIp();
  pruneLimits(db);

  // Every limit that can refuse a request runs before any password is hashed.
  const admission = admitLogin(db, ip);
  if (admission !== "ok") return { error: admission === "busy" ? SITE_BUSY : LOGIN_THROTTLED };

  const row =
    identifier.length <= LIMITS.emailMax
      ? (db
          .prepare("SELECT id, email, password_hash, email_verified_at FROM users WHERE username = ? OR email = ? LIMIT 1")
          .get(identifier, identifier) as
          | { id: number; email: string; password_hash: string; email_verified_at: string | null }
          | undefined)
      : undefined;

  const subject = loginSubject(identifier, row ? Number(row.id) : null);
  if (!reserveLoginPair(db, ip, subject)) return { error: LOGIN_THROTTLED };

  const delay = loginDelayMs(db, subject);
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

  // Always run one full verification, whether or not the account exists.
  const withinLimit = password.length <= LIMITS.passwordMax;
  const stored = row?.password_hash ?? (await dummyPasswordHash());
  const matches = await verifyPassword(withinLimit ? password : "", stored).catch(nullIfBusy);
  if (matches === null) return { error: SITE_BUSY };

  if (!row || !withinLimit || !matches) {
    recordLoginFailure(db, subject);
    return { error: LOGIN_FAILED };
  }

  recordLoginSuccess(db, ip, subject);

  if (row.email_verified_at === null) {
    sendVerification(db, Number(row.id), row.email, next);
    redirect("/check-email");
  }

  await createSession(Number(row.id));
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

/* Passwords and sessions ---------------------------------------------------- */

export async function requestPasswordResetAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const email = formText(data, "email").trim().toLowerCase();
  if (email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
  if (!mailReady()) return { error: MAIL_OFF };

  const db = getDb();
  pruneLimits(db);
  if (!allowResetRequest(db, await clientIp())) return { error: "Too many requests. Try again in an hour." };

  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number } | undefined;
  if (row && allowMailTo(db, email)) {
    const token = issueToken(db, Number(row.id), "reset");
    sendMail({
      to: email,
      subject: "Reset your Tried & Kept password",
      text: `Use this link to choose a new password:\n\n${appUrl(`/reset-password?token=${token}`)}\n\nThis link works for one hour and can be used once. If you did not ask for it, you can ignore this message.`,
    });
  }
  return { ok: "If that email has an account, a reset link is on its way. It works for one hour." };
}

export async function resetPasswordAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const token = formText(data, "token");
  const password = formText(data, "password");

  const passwordProblem = passwordError(password);
  if (passwordProblem) return { error: passwordProblem };

  const db = getDb();
  if (!tokenIsLive(db, token, "reset")) return { error: `${LINK_DEAD} Ask for a new one.` };

  const passwordHash = await hashPassword(password).catch(nullIfBusy);
  if (passwordHash === null) return { error: SITE_BUSY };

  const used = consumeToken(db, token, "reset");
  if (!used) return { error: `${LINK_DEAD} Ask for a new one.` };

  // The link reached this inbox, which also proves the player owns the address.
  db.prepare(
    "UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, datetime('now')) WHERE id = ?",
  ).run(passwordHash, used.userId);
  awardXp(db, used.userId, "signup", XP.signup);
  destroyAllSessions(used.userId);
  recordLoginSuccess(db, await clientIp(), loginSubject("", used.userId));
  await createSession(used.userId);
  revalidatePath("/", "layout");
  redirect("/me");
}

/** Checks the password of the player who is already logged in. */
async function confirmPassword(db: Db, userId: number, password: string): Promise<string | null> {
  if (!allowReauth(db, userId)) return LOGIN_THROTTLED;
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as { password_hash: string };
  if (password.length > LIMITS.passwordMax) return WRONG_PASSWORD;
  const matches = await verifyPassword(password, row.password_hash).catch(nullIfBusy);
  if (matches === null) return SITE_BUSY;
  return matches ? null : WRONG_PASSWORD;
}

export async function changePasswordAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const newPassword = formText(data, "new_password");

  const passwordProblem = passwordError(newPassword);
  if (passwordProblem) return { error: passwordProblem };

  const db = getDb();
  const refused = await confirmPassword(db, user.id, formText(data, "current_password"));
  if (refused) return { error: refused };

  const passwordHash = await hashPassword(newPassword).catch(nullIfBusy);
  if (passwordHash === null) return { error: SITE_BUSY };

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, user.id);
  destroyAllSessions(user.id);
  await createSession(user.id);

  if (mailReady() && allowMailTo(db, user.email)) {
    sendMail({
      to: user.email,
      subject: "Your Tried & Kept password changed",
      text: `Your password was just changed. If this was not you, reset it now:\n\n${appUrl("/forgot-password")}`,
    });
  }
  return { ok: "Password changed. Every other device has been logged out." };
}

export async function logoutOtherDevicesAction(_prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  await destroyOtherSessions(user.id);
  return { ok: "Every other device has been logged out." };
}

export async function deleteAccountAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const db = getDb();

  const refused = await confirmPassword(db, user.id, formText(data, "password"));
  if (refused) return { error: refused };

  // Foreign keys remove everything the account owns and detach its retailer clicks.
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/privacy?deleted=1");
}

/* Profile ---------------------------------------------------------------- */

export async function updateProfileAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();

  const displayName = cleanDisplayName(formText(data, "display_name"));
  const bio = cleanText(formText(data, "bio"), true);
  const surface = formText(data, "home_surface");
  const level = formText(data, "play_level");
  const weekly = parseOptionalNumber(formText(data, "weekly_hours"), 0, LIMITS.weeklyHoursMax);

  const nameProblem = displayNameError(displayName);
  if (nameProblem) return { error: nameProblem };
  if (bio.length > LIMITS.bioMax) return { error: `Keep your bio to ${LIMITS.bioMax} characters.` };
  if (surface !== "" && !SURFACES.some((s) => s.value === surface)) return { error: "Choose a surface from the list." };
  if (level !== "" && !PLAY_LEVELS.some((l) => l.value === level)) return { error: "Choose a level from the list." };
  if (!weekly.ok) return { error: `Weekly hours must be a number from 0 to ${LIMITS.weeklyHoursMax}.` };

  const db = getDb();
  db.prepare(
    "UPDATE users SET display_name = ?, bio = ?, home_surface = ?, play_level = ?, weekly_hours = ? WHERE id = ?",
  ).run(displayName, bio, surface, level, weekly.value, user.id);

  const complete = bio !== "" && surface !== "" && level !== "" && weekly.value !== null;
  const earned = complete && awardXp(db, user.id, "profile:complete", XP.profileComplete);

  revalidatePath("/", "layout");
  revalidatePath("/me");
  revalidatePath(`/u/${user.username}`);
  return { ok: earned ? `Profile saved. You earned ${XP.profileComplete} XP.` : "Profile saved." };
}
