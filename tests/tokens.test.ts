import type { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "@/lib/db";
import { TOKEN_TTL_MS, consumeToken, issueToken, tokenIsLive } from "@/lib/tokens";
import { addUser } from "./helpers";

const NOW = 1_000_000;

describe("email tokens", () => {
  let db: DatabaseSync;
  let userId: number;

  beforeEach(() => {
    db = openDb(":memory:");
    userId = addUser(db, "player");
  });

  it("works once", () => {
    const token = issueToken(db, userId, "reset", "/me", NOW);
    expect(consumeToken(db, token, "reset", NOW)).toEqual({ userId, nextPath: "/me" });
    expect(consumeToken(db, token, "reset", NOW)).toBeNull();
  });

  it("expires", () => {
    const token = issueToken(db, userId, "reset", "/me", NOW);
    expect(tokenIsLive(db, token, "reset", NOW + TOKEN_TTL_MS.reset)).toBe(false);
    expect(consumeToken(db, token, "reset", NOW + TOKEN_TTL_MS.reset)).toBeNull();
  });

  it("cannot be used for another purpose", () => {
    const token = issueToken(db, userId, "verify", "/me", NOW);
    expect(consumeToken(db, token, "reset", NOW)).toBeNull();
  });

  it("stops working when a newer one is issued", () => {
    const first = issueToken(db, userId, "reset", "/me", NOW);
    const second = issueToken(db, userId, "reset", "/me", NOW);
    expect(tokenIsLive(db, first, "reset", NOW)).toBe(false);
    expect(tokenIsLive(db, second, "reset", NOW)).toBe(true);
  });

  it("stores only a hash of the token", () => {
    const token = issueToken(db, userId, "verify", "/me", NOW);
    const row = db.prepare("SELECT token_hash FROM email_tokens").get() as { token_hash: string };
    expect(row.token_hash).not.toBe(token);
  });
});

describe("deleting an account", () => {
  it("removes what the player owns and detaches retailer clicks", () => {
    const db = openDb(":memory:");
    const userId = addUser(db, "player");
    issueToken(db, userId, "verify", "/me", NOW);
    db.prepare("INSERT INTO locker_items (user_id, product_slug, status, notes) VALUES (?, 'nike-vapor-12', 'using', 'x')").run(userId);
    db.prepare("INSERT INTO reports (user_id, product_slug, outcome) VALUES (?, 'nike-vapor-12', 'kept')").run(userId);
    db.prepare("INSERT INTO xp_events (user_id, event_key, points) VALUES (?, 'signup', 10)").run(userId);
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ('t', ?, '2030-01-01')").run(userId);
    db.prepare("INSERT INTO affiliate_clicks (offer_id, user_id) VALUES ('nike-vapor-12-nike', ?)").run(userId);

    db.prepare("DELETE FROM users WHERE id = ?").run(userId);

    for (const table of ["locker_items", "reports", "xp_events", "sessions", "email_tokens"]) {
      expect((db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n, table).toBe(0);
    }
    expect((db.prepare("SELECT user_id FROM affiliate_clicks").get() as { user_id: number | null }).user_id).toBeNull();
  });
});
