import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

/**
 * Rate limits kept in SQLite. Each counter has its own row and expiry, so a flood
 * of other keys can never push an active limit out. Every window is one hour or less.
 */

const MINUTE = 60_000;

export function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

/** Counts one event and returns the total inside the current window. */
export function hit(db: DatabaseSync, bucket: string, windowMs: number, now = Date.now()): number {
  const row = db
    .prepare(
      `INSERT INTO rate_limits (bucket, count, reset_at) VALUES (?, 1, ?)
       ON CONFLICT (bucket) DO UPDATE SET
         count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
         reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END
       RETURNING count`,
    )
    .get(bucket, now + windowMs, now, now) as { count: number };
  return Number(row.count);
}

export function peek(db: DatabaseSync, bucket: string, now = Date.now()): number {
  const row = db.prepare("SELECT count FROM rate_limits WHERE bucket = ? AND reset_at > ?").get(bucket, now) as
    | { count: number }
    | undefined;
  return row ? Number(row.count) : 0;
}

function refund(db: DatabaseSync, bucket: string): void {
  db.prepare("UPDATE rate_limits SET count = MAX(count - 1, 0) WHERE bucket = ?").run(bucket);
}

function clear(db: DatabaseSync, bucket: string): void {
  db.prepare("DELETE FROM rate_limits WHERE bucket = ?").run(bucket);
}

export function pruneLimits(db: DatabaseSync, now = Date.now()): void {
  db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now);
}

/** Counts the event and says whether it is still inside the limit. */
export function allow(db: DatabaseSync, bucket: string, max: number, windowMs: number, now = Date.now()): boolean {
  return hit(db, bucket, windowMs, now) <= max;
}

/* Login ------------------------------------------------------------------ */

export const LOGIN_LIMITS = {
  windowMs: 15 * MINUTE,
  /** Attempts from one address, across every account. */
  perIp: 30,
  /** Attempts from one address against one account. A hard stop for that pair only. */
  perIpAndAccount: 8,
  /** Failures on one account from anywhere before each new attempt slows down. */
  accountFreeFailures: 8,
  baseDelayMs: 250,
  maxDelayMs: 4_000,
  /** Site-wide failures before addresses that already failed are turned away. */
  globalSoft: 200,
  /** Site-wide failures before login pauses for everyone. */
  globalHard: 1_000,
} as const;

const GLOBAL_BUCKET = "login:global";
const ipBucket = (ip: string) => `login:ip:${hashKey(ip)}`;
const pairBucket = (ip: string, subject: string) => `login:pair:${hashKey(`${ip}|${subject}`)}`;
const accountBucket = (subject: string) => `login:account:${subject}`;

/** One bucket per account, whether the player typed a username or an email. */
export function loginSubject(identifier: string, userId: number | null): string {
  return userId !== null ? `user:${userId}` : `unknown:${hashKey(identifier)}`;
}

export type LoginAdmission = "ok" | "throttled" | "busy";

/** Runs before any account lookup or hashing. Reserves one attempt for this address. */
export function admitLogin(db: DatabaseSync, ip: string, now = Date.now()): LoginAdmission {
  const globalFailures = peek(db, GLOBAL_BUCKET, now);
  if (globalFailures >= LOGIN_LIMITS.globalHard) return "busy";

  const fromIp = peek(db, ipBucket(ip), now);
  if (fromIp >= LOGIN_LIMITS.perIp) return "throttled";
  if (globalFailures >= LOGIN_LIMITS.globalSoft && fromIp > 0) return "throttled";

  hit(db, ipBucket(ip), LOGIN_LIMITS.windowMs, now);
  return "ok";
}

/** Blocks only this address, so a stranger cannot lock the owner out of their account. */
export function reserveLoginPair(db: DatabaseSync, ip: string, subject: string, now = Date.now()): boolean {
  return allow(db, pairBucket(ip, subject), LOGIN_LIMITS.perIpAndAccount, LOGIN_LIMITS.windowMs, now);
}

/** Slows repeated failures on one account without ever refusing the right password. */
export function loginDelayMs(db: DatabaseSync, subject: string, now = Date.now()): number {
  const over = peek(db, accountBucket(subject), now) - LOGIN_LIMITS.accountFreeFailures;
  if (over < 0) return 0;
  return Math.min(LOGIN_LIMITS.baseDelayMs * 2 ** Math.min(over, 8), LOGIN_LIMITS.maxDelayMs);
}

export function recordLoginFailure(db: DatabaseSync, subject: string, now = Date.now()): void {
  hit(db, accountBucket(subject), LOGIN_LIMITS.windowMs, now);
  hit(db, GLOBAL_BUCKET, LOGIN_LIMITS.windowMs, now);
}

export function recordLoginSuccess(db: DatabaseSync, ip: string, subject: string): void {
  refund(db, ipBucket(ip));
  clear(db, pairBucket(ip, subject));
  clear(db, accountBucket(subject));
}

/* Other account actions --------------------------------------------------- */

const HOUR = 60 * MINUTE;

export function allowSignup(db: DatabaseSync, ip: string, now = Date.now()): boolean {
  return (
    allow(db, `signup:ip:${hashKey(ip)}`, 5, HOUR, now) &&
    allow(db, "signup:global", 200, HOUR, now)
  );
}

export function allowResetRequest(db: DatabaseSync, ip: string, now = Date.now()): boolean {
  return allow(db, `forgot:ip:${hashKey(ip)}`, 5, HOUR, now);
}

/** Caps mail to one address, so the site cannot be used to flood someone's inbox. */
export function allowMailTo(db: DatabaseSync, email: string, now = Date.now()): boolean {
  return allow(db, `mail:${hashKey(email)}`, 4, HOUR, now);
}

/** Password checks made while already logged in, such as changing a password. */
export function allowReauth(db: DatabaseSync, userId: number, now = Date.now()): boolean {
  return allow(db, `reauth:${userId}`, 8, LOGIN_LIMITS.windowMs, now);
}
