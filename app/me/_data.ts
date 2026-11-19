import { getDb } from "@/lib/db";
import type { LockerStatus } from "./_shared";

export type LockerRow = {
  id: number;
  product_slug: string;
  status: LockerStatus;
  size: string;
  width: string;
  hours: number | null;
  price_paid: number | null;
  notes: string;
};

/** What anyone may see. Price paid and notes are deliberately not selected. */
export type PublicLockerRow = Pick<LockerRow, "id" | "product_slug" | "status" | "size" | "width" | "hours">;

/** Email is deliberately not selected. */
export type PublicProfile = {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  home_surface: string;
  play_level: string;
};

export function getLocker(userId: number): LockerRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, product_slug, status, size, width, hours, price_paid, notes
       FROM locker_items WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
    )
    .all(userId);
  return rows.map((row) => ({ ...row }) as unknown as LockerRow);
}

export function getPublicLocker(userId: number): PublicLockerRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, product_slug, status, size, width, hours
       FROM locker_items WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
    )
    .all(userId);
  return rows.map((row) => ({ ...row }) as unknown as PublicLockerRow);
}

export function getPublicProfile(username: string): PublicProfile | null {
  const row = getDb()
    .prepare("SELECT id, username, display_name, bio, home_surface, play_level FROM users WHERE username = ?")
    .get(username);
  return row ? ({ ...row } as unknown as PublicProfile) : null;
}
