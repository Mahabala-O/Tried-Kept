import type { DatabaseSync } from "node:sqlite";

/** Inserts a throwaway account into an in-memory test database. */
export function addUser(db: DatabaseSync, username: string): number {
  const result = db
    .prepare("INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, 'x:y', ?)")
    .run(username, `${username}@test.invalid`, username);
  return Number(result.lastInsertRowid);
}

export function addReport(
  db: DatabaseSync,
  userId: number,
  outcome: "kept" | "returned" | "rejected" | "testing",
  switchedFrom: string | null = null,
): number {
  const result = db
    .prepare("INSERT INTO reports (user_id, product_slug, outcome, switched_from_slug) VALUES (?, 'nike-vapor-12', ?, ?)")
    .run(userId, outcome, switchedFrom);
  return Number(result.lastInsertRowid);
}
