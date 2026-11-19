import { createHash, randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export type TokenPurpose = "verify" | "reset";

export const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  verify: 24 * 3_600_000,
  reset: 3_600_000,
};

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/** Issues a new single-use link token. Any older token for the same purpose stops working. */
export function issueToken(
  db: DatabaseSync,
  userId: number,
  purpose: TokenPurpose,
  nextPath = "/me",
  now = Date.now(),
): string {
  const token = randomBytes(32).toString("base64url");
  db.prepare("DELETE FROM email_tokens WHERE expires_at <= ? OR (user_id = ? AND purpose = ?)").run(now, userId, purpose);
  db.prepare("INSERT INTO email_tokens (token_hash, user_id, purpose, next_path, expires_at) VALUES (?, ?, ?, ?, ?)").run(
    hash(token),
    userId,
    purpose,
    nextPath,
    now + TOKEN_TTL_MS[purpose],
  );
  return token;
}

/** Checks a token without using it up, so a page can show the right form. */
export function tokenIsLive(db: DatabaseSync, token: string, purpose: TokenPurpose, now = Date.now()): boolean {
  return Boolean(
    db
      .prepare("SELECT 1 FROM email_tokens WHERE token_hash = ? AND purpose = ? AND expires_at > ?")
      .get(hash(token), purpose, now),
  );
}

/** Uses a token up. The delete is atomic, so two requests cannot both succeed. */
export function consumeToken(
  db: DatabaseSync,
  token: string,
  purpose: TokenPurpose,
  now = Date.now(),
): { userId: number; nextPath: string } | null {
  const row = db
    .prepare(
      `DELETE FROM email_tokens WHERE token_hash = ? AND purpose = ? AND expires_at > ?
       RETURNING user_id, next_path`,
    )
    .get(hash(token), purpose, now) as { user_id: number; next_path: string } | undefined;
  return row ? { userId: Number(row.user_id), nextPath: String(row.next_path) } : null;
}
