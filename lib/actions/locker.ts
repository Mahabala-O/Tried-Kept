"use server";

import { revalidatePath } from "next/cache";
import {
  LIMITS,
  cleanText,
  formText,
  isLockerStatus,
  parseOptionalNumber,
  type ActionState,
} from "@/app/me/_shared";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { XP, awardXp } from "@/lib/gamification";

const ITEM_MISSING = "We could not find that item in your locker.";

function refresh(username: string, productSlug: string): void {
  revalidatePath("/", "layout");
  revalidatePath("/me");
  revalidatePath(`/u/${username}`);
  revalidatePath(`/gear/${productSlug}`);
}

function parseItemId(raw: string): number | null {
  return /^[1-9]\d{0,14}$/.test(raw) ? Number(raw) : null;
}

/** Looks the item up through its owner, so another player's id never matches. */
function ownedSlug(itemId: number, userId: number): string | null {
  const row = getDb()
    .prepare("SELECT product_slug FROM locker_items WHERE id = ? AND user_id = ?")
    .get(itemId, userId) as { product_slug: string } | undefined;
  return row ? String(row.product_slug) : null;
}

export async function addToLockerAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const slug = formText(data, "product_slug");
  const status = formText(data, "status");

  if (!getProduct(slug)) return { error: "Choose a model from the list." };
  if (!isLockerStatus(status)) return { error: "Choose a status from the list." };

  const db = getDb();
  const existing = db.prepare("SELECT 1 FROM locker_items WHERE user_id = ? AND product_slug = ?").get(user.id, slug);
  db.prepare(
    `INSERT INTO locker_items (user_id, product_slug, status) VALUES (?, ?, ?)
     ON CONFLICT (user_id, product_slug) DO UPDATE SET status = excluded.status`,
  ).run(user.id, slug, status);

  // The event key pays out once per product, even after a remove and re-add.
  const earned = awardXp(db, user.id, `locker:${slug}`, XP.lockerItem);

  refresh(user.username, slug);
  if (existing) return { ok: "Locker updated." };
  return { ok: earned ? `Added to your locker. You earned ${XP.lockerItem} XP.` : "Added to your locker." };
}

export async function updateLockerItemAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const itemId = parseItemId(formText(data, "item_id"));
  const slug = itemId === null ? null : ownedSlug(itemId, user.id);
  if (itemId === null || slug === null) return { error: ITEM_MISSING };

  const status = formText(data, "status");
  const size = cleanText(formText(data, "size"));
  const width = cleanText(formText(data, "width"));
  const notes = cleanText(formText(data, "notes"), true);
  const hours = parseOptionalNumber(formText(data, "hours"), 0, LIMITS.hoursMax);
  const price = parseOptionalNumber(formText(data, "price_paid"), 0, LIMITS.priceMax);

  if (!isLockerStatus(status)) return { error: "Choose a status from the list." };
  if (size.length > LIMITS.sizeMax) return { error: `Keep size to ${LIMITS.sizeMax} characters.` };
  if (width.length > LIMITS.widthMax) return { error: `Keep width to ${LIMITS.widthMax} characters.` };
  if (notes.length > LIMITS.notesMax) return { error: `Keep notes to ${LIMITS.notesMax} characters.` };
  if (!hours.ok) return { error: `Hours must be a number from 0 to ${LIMITS.hoursMax}.` };
  if (!price.ok) return { error: `Price paid must be a number from 0 to ${LIMITS.priceMax}.` };

  getDb()
    .prepare(
      `UPDATE locker_items SET status = ?, size = ?, width = ?, hours = ?, price_paid = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
    )
    .run(status, size, width, hours.value, price.value, notes, itemId, user.id);

  refresh(user.username, slug);
  return { ok: "Saved." };
}

export async function removeLockerItemAction(_prev: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const itemId = parseItemId(formText(data, "item_id"));
  const slug = itemId === null ? null : ownedSlug(itemId, user.id);
  if (itemId === null || slug === null) return { error: ITEM_MISSING };

  getDb().prepare("DELETE FROM locker_items WHERE id = ? AND user_id = ?").run(itemId, user.id);

  refresh(user.username, slug);
  return { ok: "Removed." };
}
