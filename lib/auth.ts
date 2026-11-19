import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

const COOKIE = "tk_session";
const SESSION_DAYS = 30;
const HASH_BYTES = 64;

export type User = {
  id: number;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  home_surface: string;
  play_level: string;
  weekly_hours: number | null;
  created_at: string;
};

/* Password hashing ------------------------------------------------------- */

const derive = promisify(scrypt) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;

/** Matches the default thread pool, so hashing can never queue up behind itself there. */
const MAX_ACTIVE_HASHES = 4;
const MAX_WAITING_HASHES = 64;

/** Thrown when too many passwords are waiting to be hashed. Callers ask the player to retry. */
export class HashingBusyError extends Error {}

let activeHashes = 0;
const waitingHashes: (() => void)[] = [];

async function withHashSlot<T>(work: () => Promise<T>): Promise<T> {
  if (activeHashes >= MAX_ACTIVE_HASHES) {
    if (waitingHashes.length >= MAX_WAITING_HASHES) throw new HashingBusyError();
    await new Promise<void>((resolve) => waitingHashes.push(resolve));
  } else {
    activeHashes += 1;
  }
  try {
    return await work();
  } finally {
    const next = waitingHashes.shift();
    if (next) next();
    else activeHashes -= 1;
  }
}

async function deriveStored(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, HASH_BYTES);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function hashPassword(password: string): Promise<string> {
  return withHashSlot(() => deriveStored(password));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  // A malformed hash decodes short or empty, and two empty buffers compare equal.
  if (expected.length !== HASH_BYTES) return false;
  const actual = await withHashSlot(() => derive(password, Buffer.from(saltHex, "hex"), HASH_BYTES));
  return timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/** Verified when no account matches, so a miss takes as long as a wrong password. */
export function dummyPasswordHash(): Promise<string> {
  dummyHash ??= deriveStored(randomBytes(24).toString("hex"));
  return dummyHash;
}

/* Sessions --------------------------------------------------------------- */

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    hashToken(token),
    userId,
    expires.toISOString(),
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  jar.delete(COOKIE);
}

/** Ends every session for this player, on every device. */
export function destroyAllSessions(userId: number): void {
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

/** Ends every session except the one making this request. */
export async function destroyOtherSessions(userId: number): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  getDb()
    .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?")
    .run(userId, token ? hashToken(token) : "");
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.username, u.email, u.display_name, u.bio, u.home_surface,
              u.play_level, u.weekly_hours, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ? AND u.email_verified_at IS NOT NULL`,
    )
    .get(hashToken(token), new Date().toISOString());
  return row ? ({ ...row } as User) : null;
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
