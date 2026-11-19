import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { XP, totalXp } from "@/lib/gamification";
import {
  HELPFUL_XP_VOTES_PER_AUTHOR,
  deleteOwnReport,
  parseReportForm,
  recentReportReceipt,
  saveReport,
  toggleHelpfulVote,
  type ReportInput,
} from "@/lib/reports";
import { addUser } from "./helpers";

const input = (productSlug: string): ReportInput => ({
  productSlug,
  switchedFromSlug: null,
  outcome: "kept",
  comfort: null,
  size: "",
  width: "",
  surface: "",
  hours: null,
  feltDifferent: "",
  reason: "x",
  wearLocation: "",
  stringSetup: "",
});

function save(userId: number, slug: string): number {
  const saved = saveReport(userId, input(slug));
  if (!saved.ok) throw new Error(saved.error);
  return saved.id;
}

describe("report rules", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "tk-reports-"));
  let db: DatabaseSync;
  let author: number;
  let voter: number;
  let run = 0;
  const helpfulXp = () =>
    Number(
      (db.prepare("SELECT COALESCE(SUM(points), 0) AS n FROM xp_events WHERE user_id = ? AND event_key LIKE 'helpful:%'").get(author) as { n: number }).n,
    );

  beforeAll(() => {
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    db = getDb();
  });

  afterAll(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  beforeEach(() => {
    run += 1;
    author = addUser(db, `author${run}`);
    voter = addUser(db, `voter${run}`);
  });

  it("keeps the daily limit after a report is deleted", () => {
    const id = save(author, "nike-vapor-12");
    expect(deleteOwnReport(author, id)).toBe(true);
    expect(saveReport(author, input("nike-vapor-12")).ok).toBe(false);
  });

  it("pays a voter's helpful XP once per model, even across reports", () => {
    const first = save(author, "nike-vapor-12");
    toggleHelpfulVote(voter, first);
    db.prepare("DELETE FROM report_submissions WHERE user_id = ?").run(author);
    const repost = save(author, "nike-vapor-12");
    toggleHelpfulVote(voter, repost);
    expect(helpfulXp()).toBe(XP.helpfulReceived);
  });

  it("caps the helpful XP one voter can send to one author", () => {
    const slugs = ["nike-vapor-12", "nike-vapor-pro-3", "nike-vapor-pro-2", "asics-gel-resolution-9", "yonex-eclipsion-5"];
    for (const slug of slugs) toggleHelpfulVote(voter, save(author, slug));
    expect(helpfulXp()).toBe(HELPFUL_XP_VOTES_PER_AUTHOR * XP.helpfulReceived);
  });

  it("confirms what a report actually earned", () => {
    save(author, "nike-vapor-12");
    expect(recentReportReceipt(author, "nike-vapor-12")).toEqual({ xp: totalXp(db, author) });
    expect(recentReportReceipt(author, "nike-vapor-pro-3")).toBeNull();
    expect(recentReportReceipt(voter, "nike-vapor-12")).toBeNull();
  });

  it("drops a width sent for a racquet", () => {
    const form = new FormData();
    form.set("product", "yonex-ezone-98-2025");
    form.set("outcome", "kept");
    form.set("reason", "Stable on off-center hits");
    form.set("width", "wide");
    const parsed = parseReportForm(form);
    expect(parsed.ok && parsed.value.width).toBe("");
  });
});
