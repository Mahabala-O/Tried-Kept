import { getProduct } from "./catalog";
import { getDb } from "./db";
import { awardXp, reportXp, XP } from "./gamification";

/** The most helpful-vote XP one voter can ever send to one author, in votes. */
export const HELPFUL_XP_VOTES_PER_AUTHOR = 3;

export const OUTCOMES = [
  { value: "kept", label: "Kept" },
  { value: "returned", label: "Returned" },
  { value: "rejected", label: "Tried and rejected" },
  { value: "testing", label: "Still testing" },
] as const;
export type Outcome = (typeof OUTCOMES)[number]["value"];

export const SURFACES = [
  { value: "hard", label: "Hard court" },
  { value: "clay", label: "Clay" },
  { value: "grass", label: "Grass" },
  { value: "indoor", label: "Indoor" },
  { value: "mixed", label: "Mixed surfaces" },
] as const;
export type Surface = (typeof SURFACES)[number]["value"];

export const REPORT_LIMITS = {
  size: 40,
  width: 40,
  wear: 120,
  stringSetup: 120,
  feltDifferent: 500,
  reason: 500,
  hours: 5000,
} as const;

export function isOutcome(value: string): value is Outcome {
  return OUTCOMES.some((o) => o.value === value);
}

export function isSurface(value: string): value is Surface {
  return SURFACES.some((s) => s.value === value);
}

export function outcomeLabel(value: string): string {
  return OUTCOMES.find((o) => o.value === value)?.label ?? value;
}

export function surfaceLabel(value: string): string {
  return SURFACES.find((s) => s.value === value)?.label ?? value;
}

/** Shared result shape for the report server actions. */
export type ReportActionState = { error?: string };

export type ReportView = {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  product_slug: string;
  switched_from_slug: string | null;
  outcome: Outcome;
  comfort: number | null;
  size: string;
  width: string;
  surface: string;
  hours: number | null;
  felt_different: string;
  reason: string;
  wear_location: string;
  string_setup: string;
  created_at: string;
  helpful_count: number;
  viewer_voted: boolean;
};

export type ReportFilters = {
  productSlug?: string;
  userId?: number;
  outcome?: Outcome;
  surface?: Surface;
  /** Partial, case-insensitive match on the width the player wrote. */
  width?: string;
};

type SqlValue = string | number | null;

function filterSql(filters: ReportFilters): { where: string; params: SqlValue[] } {
  const clauses: string[] = [];
  const params: SqlValue[] = [];
  if (filters.productSlug) {
    clauses.push("r.product_slug = ?");
    params.push(filters.productSlug);
  }
  if (filters.userId !== undefined) {
    clauses.push("r.user_id = ?");
    params.push(filters.userId);
  }
  if (filters.outcome) {
    clauses.push("r.outcome = ?");
    params.push(filters.outcome);
  }
  if (filters.surface) {
    clauses.push("r.surface = ?");
    params.push(filters.surface);
  }
  const width = filters.width?.trim();
  if (width) {
    clauses.push("r.width LIKE ? ESCAPE '\\'");
    params.push(`%${width.replace(/[\\%_]/g, "\\$&")}%`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

const REPORT_COLUMNS = `
  r.id, r.user_id, u.username, u.display_name, r.product_slug, r.switched_from_slug,
  r.outcome, r.comfort, r.size, r.width, r.surface, r.hours, r.felt_different, r.reason,
  r.wear_location, r.string_setup, r.created_at,
  (SELECT COUNT(*) FROM helpful_votes hv WHERE hv.report_id = r.id) AS helpful_count,
  EXISTS (SELECT 1 FROM helpful_votes mine WHERE mine.report_id = r.id AND mine.user_id = ?) AS viewer_voted
`;

function toReportView(row: unknown): ReportView {
  const r = row as Omit<ReportView, "viewer_voted"> & { viewer_voted: number };
  return { ...r, helpful_count: Number(r.helpful_count), viewer_voted: Number(r.viewer_voted) === 1 };
}

export function listReports(
  options: ReportFilters & { limit: number; offset: number; viewerId?: number | null },
): ReportView[] {
  const { where, params } = filterSql(options);
  const limit = Math.min(Math.max(1, Math.trunc(options.limit)), 100);
  const offset = Math.max(0, Math.trunc(options.offset));
  const rows = getDb()
    .prepare(
      `SELECT ${REPORT_COLUMNS}
       FROM reports r JOIN users u ON u.id = r.user_id
       ${where}
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(options.viewerId ?? null, ...params, limit, offset);
  return rows.map(toReportView);
}

export function countReports(filters: ReportFilters): number {
  const { where, params } = filterSql(filters);
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM reports r ${where}`)
    .get(...params) as { n: number };
  return Number(row.n);
}

export function getReport(id: number, viewerId: number | null = null): ReportView | null {
  const row = getDb()
    .prepare(
      `SELECT ${REPORT_COLUMNS}
       FROM reports r JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
    )
    .get(viewerId, id);
  return row ? toReportView(row) : null;
}

export type OutcomeTallies = Record<Outcome, number> & { total: number };

export function outcomeTallies(productSlug: string): OutcomeTallies {
  const rows = getDb()
    .prepare("SELECT outcome, COUNT(*) AS n FROM reports WHERE product_slug = ? GROUP BY outcome")
    .all(productSlug) as unknown as { outcome: Outcome; n: number }[];
  const tallies: OutcomeTallies = { kept: 0, returned: 0, rejected: 0, testing: 0, total: 0 };
  for (const row of rows) {
    tallies[row.outcome] = Number(row.n);
    tallies.total += Number(row.n);
  }
  return tallies;
}

export type LeaderboardEntry = { id: number; username: string; display_name: string; xp: number };

export function leaderboard(limit: number): LeaderboardEntry[] {
  const rows = getDb()
    .prepare(
      `SELECT u.id, u.username, u.display_name, SUM(x.points) AS xp
       FROM xp_events x JOIN users u ON u.id = x.user_id
       GROUP BY u.id
       HAVING SUM(x.points) > 0
       ORDER BY xp DESC, u.id ASC
       LIMIT ?`,
    )
    .all(Math.min(Math.max(1, Math.trunc(limit)), 100)) as unknown as LeaderboardEntry[];
  return rows.map((row) => ({ ...row, xp: Number(row.xp) }));
}

/** Models this user has already earned report XP for. */
export function rewardedProductSlugs(userId: number): string[] {
  const rows = getDb()
    .prepare("SELECT event_key FROM xp_events WHERE user_id = ? AND event_key LIKE 'report:%'")
    .all(userId) as unknown as { event_key: string }[];
  return rows.map((row) => row.event_key.slice("report:".length));
}

/* Validation ------------------------------------------------------------ */

export type ReportInput = {
  productSlug: string;
  switchedFromSlug: string | null;
  outcome: Outcome;
  comfort: number | null;
  size: string;
  width: string;
  surface: Surface | "";
  hours: number | null;
  feltDifferent: string;
  reason: string;
  wearLocation: string;
  stringSetup: string;
};

type Parsed = { ok: true; value: ReportInput } | { ok: false; error: string };

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Treats every submitted value as untrusted, whatever the form allowed. */
export function parseReportForm(form: FormData): Parsed {
  const fail = (error: string): Parsed => ({ ok: false, error });

  const productSlug = field(form, "product");
  const product = getProduct(productSlug);
  if (!product) return fail("Choose a model from the list.");

  const switchedFromSlug = field(form, "switched_from") || null;
  if (switchedFromSlug) {
    const previous = getProduct(switchedFromSlug);
    if (!previous) return fail("Choose the model you switched from from the list.");
    if (previous.slug === product.slug) return fail("The model you switched from must be a different model.");
    if (previous.category !== product.category) return fail("Choose a switch between two shoes or two racquets.");
  }

  const outcome = field(form, "outcome");
  if (!isOutcome(outcome)) return fail("Choose what happened with this model.");

  const comfortText = field(form, "comfort");
  if (comfortText && !/^[1-5]$/.test(comfortText)) return fail("Comfort must be a whole number from 1 to 5.");
  const comfort = comfortText ? Number(comfortText) : null;

  const surface = field(form, "surface");
  if (surface && !isSurface(surface)) return fail("Choose a surface from the list.");

  const hoursText = field(form, "hours");
  if (hoursText && !/^(\d+(\.\d*)?|\.\d+)$/.test(hoursText)) return fail("Hours played must be a number.");
  const hours = hoursText ? Number(hoursText) : null;
  if (hours !== null && hours > REPORT_LIMITS.hours) {
    return fail(`Hours played must be between 0 and ${REPORT_LIMITS.hours}.`);
  }

  const size = field(form, "size");
  // Width describes a shoe, so a racquet report never carries one.
  const width = product.category === "shoe" ? field(form, "width") : "";
  const feltDifferent = field(form, "felt_different");
  const reason = field(form, "reason");
  // Wear applies to shoes and string setup to racquets, so the other is dropped.
  const wearLocation = product.category === "shoe" ? field(form, "wear_location") : "";
  const stringSetup = product.category === "racquet" ? field(form, "string_setup") : "";

  if (!reason) return fail("Add the reason for this outcome.");

  const tooLong: [string, string, number][] = [
    ["Size", size, REPORT_LIMITS.size],
    ["Width", width, REPORT_LIMITS.width],
    ["Wear location", wearLocation, REPORT_LIMITS.wear],
    ["String setup", stringSetup, REPORT_LIMITS.stringSetup],
    ["What felt different", feltDifferent, REPORT_LIMITS.feltDifferent],
    ["Reason", reason, REPORT_LIMITS.reason],
  ];
  for (const [label, value, max] of tooLong) {
    if (value.length > max) return fail(`${label} can be at most ${max} characters.`);
  }

  return {
    ok: true,
    value: {
      productSlug: product.slug,
      switchedFromSlug,
      outcome,
      comfort,
      size,
      width,
      surface: surface as Surface | "",
      hours,
      feltDifferent,
      reason,
      wearLocation,
      stringSetup,
    },
  };
}

export function parseReportId(form: FormData): number | null {
  const text = field(form, "reportId");
  if (!/^[1-9]\d{0,14}$/.test(text)) return null;
  return Number(text);
}

/* Writes ---------------------------------------------------------------- */

function inTransaction<T>(work: () => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/**
 * One report per user, per model, per UTC day. XP pays once per user and model,
 * from the amount of detail given. The outcome plays no part in the amount.
 */
export function saveReport(userId: number, input: ReportInput): { ok: true; id: number } | { ok: false; error: string } {
  const db = getDb();
  return inTransaction(() => {
    // Recorded apart from the report, so deleting a report does not reopen today's slot.
    const firstToday = db
      .prepare("INSERT OR IGNORE INTO report_submissions (user_id, product_slug, day) VALUES (?, ?, date('now'))")
      .run(userId, input.productSlug);
    if (Number(firstToday.changes) === 0) {
      return { ok: false as const, error: "You already reported on this model today. You can add another tomorrow." };
    }

    const result = db
      .prepare(
        `INSERT INTO reports (user_id, product_slug, switched_from_slug, outcome, comfort, size, width, surface,
                              hours, felt_different, reason, wear_location, string_setup)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        userId,
        input.productSlug,
        input.switchedFromSlug,
        input.outcome,
        input.comfort,
        input.size,
        input.width,
        input.surface,
        input.hours,
        input.feltDifferent,
        input.reason,
        input.wearLocation,
        input.stringSetup,
      );

    const points = reportXp({
      category: getProduct(input.productSlug)?.category,
      size: input.size,
      width: input.width,
      surface: input.surface,
      hours: input.hours,
      felt_different: input.feltDifferent,
      reason: input.reason,
      wear_location: input.wearLocation,
      string_setup: input.stringSetup,
      switched_from_slug: input.switchedFromSlug,
    });
    awardXp(db, userId, `report:${input.productSlug}`, points);

    return { ok: true as const, id: Number(result.lastInsertRowid) };
  });
}

/**
 * What a player just earned for publishing on this model. Read from the server's
 * own records, so a crafted link cannot make the confirmation claim anything.
 */
export function recentReportReceipt(userId: number, productSlug: string): { xp: number } | null {
  const db = getDb();
  const report = db
    .prepare("SELECT 1 FROM reports WHERE user_id = ? AND product_slug = ? AND created_at >= datetime('now', '-10 minutes') LIMIT 1")
    .get(userId, productSlug);
  if (!report) return null;
  const award = db
    .prepare("SELECT points FROM xp_events WHERE user_id = ? AND event_key = ? AND created_at >= datetime('now', '-10 minutes')")
    .get(userId, `report:${productSlug}`) as { points: number } | undefined;
  return { xp: award ? Number(award.points) : 0 };
}

/** Only the author can delete. Returns false when nothing was removed. */
export function deleteOwnReport(userId: number, reportId: number): boolean {
  const result = getDb().prepare("DELETE FROM reports WHERE id = ? AND user_id = ?").run(reportId, userId);
  return Number(result.changes) > 0;
}

/**
 * Toggles a helpful vote. XP pays once per voter, author and model, so reposting a
 * report cannot earn it again, and one voter can only ever pay one author a few times.
 * Removing a vote keeps that XP, and voting again does not pay twice.
 */
export function toggleHelpfulVote(voterId: number, reportId: number): { ok: true; voted: boolean } | { ok: false; error: string } {
  const db = getDb();
  return inTransaction(() => {
    const report = db.prepare("SELECT user_id, product_slug FROM reports WHERE id = ?").get(reportId) as
      | { user_id: number; product_slug: string }
      | undefined;
    if (!report) return { ok: false as const, error: "This report is no longer available." };
    if (Number(report.user_id) === voterId) {
      return { ok: false as const, error: "You cannot mark your own report as helpful." };
    }

    const removed = db.prepare("DELETE FROM helpful_votes WHERE report_id = ? AND user_id = ?").run(reportId, voterId);
    if (Number(removed.changes) > 0) return { ok: true as const, voted: false };

    db.prepare("INSERT INTO helpful_votes (report_id, user_id) VALUES (?, ?)").run(reportId, voterId);
    const authorId = Number(report.user_id);
    const paidByVoter = db
      .prepare("SELECT COUNT(*) AS n FROM xp_events WHERE user_id = ? AND event_key LIKE ?")
      .get(authorId, `helpful:${voterId}:%`) as { n: number };
    if (Number(paidByVoter.n) < HELPFUL_XP_VOTES_PER_AUTHOR) {
      awardXp(db, authorId, `helpful:${voterId}:${report.product_slug}`, XP.helpfulReceived);
    }
    return { ok: true as const, voted: true };
  });
}
