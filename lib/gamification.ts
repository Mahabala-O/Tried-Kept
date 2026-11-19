import type { DatabaseSync } from "node:sqlite";
import { comparisons, type Category } from "./catalog";

/**
 * XP rewards useful evidence. It never depends on whether a report is positive,
 * and never on clicking a retailer link, so points cannot buy favorable reviews.
 */
export const XP = {
  signup: 10,
  profileComplete: 20,
  lockerItem: 10,
  reportBase: 25,
  reportDetail: 5,
  helpfulReceived: 5,
  comparisonScouted: 5,
  finderComplete: 15,
  quizCorrect: 5,
} as const;

export const LEVELS = [
  { name: "Ball Kid", minXp: 0 },
  { name: "Club Rookie", minXp: 50 },
  { name: "Baseliner", minXp: 150 },
  { name: "Net Rusher", minXp: 300 },
  { name: "Tiebreaker", minXp: 600 },
  { name: "Match Point", minXp: 1000 },
] as const;

export function levelFor(xp: number) {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (xp >= level.minXp) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const progress = next ? Math.max(0, (xp - current.minXp) / (next.minXp - current.minXp)) : 1;
  return { index, name: current.name, next, progress, xp };
}

export type ReportDetails = {
  /** Shoes count width and wear. Racquets count their string setup. Defaults to shoe. */
  category?: Category;
  size?: string;
  width?: string;
  surface?: string;
  hours?: number | null;
  felt_different?: string;
  reason?: string;
  wear_location?: string;
  string_setup?: string;
  switched_from_slug?: string | null;
};

/** Enough words to say something specific. */
const SENTENCE_MIN = 15;
const WIDTH_WORD = /\b(narrow|standard|regular|normal|medium|wide|[a-e]|\d?e{1,4})\b/i;

const letterCount = (value = "") => value.replace(/[^\p{L}\p{N}]/gu, "").length;
const isSentence = (value?: string) => letterCount(value) >= SENTENCE_MIN;

/** String, gauge and tension are three facts, so a full setup counts as two details. */
const STRING_SETUP_DETAILS = 2;

/**
 * Each specific detail makes a report more useful to the next buyer, so filler
 * earns nothing. Zero hours counts: it is the honest answer for an unplayed return.
 * A fully detailed shoe report and racquet report pay the same.
 */
export function reportXp(details: ReportDetails): number {
  const isRacquet = details.category === "racquet";
  const checks = [
    /\d/.test(details.size ?? ""),
    Boolean(details.surface),
    details.hours !== undefined && details.hours !== null && details.hours >= 0,
    isSentence(details.felt_different),
    isSentence(details.reason),
    Boolean(details.switched_from_slug),
    !isRacquet && WIDTH_WORD.test(details.width ?? ""),
    !isRacquet && letterCount(details.wear_location) >= 3,
  ];
  const filled = checks.filter(Boolean).length;
  const strings = isRacquet && letterCount(details.string_setup) >= 5 ? STRING_SETUP_DETAILS : 0;
  return XP.reportBase + (filled + strings) * XP.reportDetail;
}

/** Idempotent: the same event key can only ever pay out once per user. */
export function awardXp(db: DatabaseSync, userId: number, eventKey: string, points: number): boolean {
  const result = db
    .prepare("INSERT OR IGNORE INTO xp_events (user_id, event_key, points) VALUES (?, ?, ?)")
    .run(userId, eventKey, points);
  return Number(result.changes) > 0;
}

export function totalXp(db: DatabaseSync, userId: number): number {
  const row = db.prepare("SELECT COALESCE(SUM(points), 0) AS xp FROM xp_events WHERE user_id = ?").get(userId) as {
    xp: number;
  };
  return Number(row.xp);
}

export type Badge = { id: string; name: string; description: string; earned: boolean };

export function badgesFor(db: DatabaseSync, userId: number): Badge[] {
  const count = (sql: string) => Number((db.prepare(sql).get(userId) as { n: number }).n);

  const lockerCount = count("SELECT COUNT(*) AS n FROM locker_items WHERE user_id = ?");
  const reportCount = count("SELECT COUNT(*) AS n FROM reports WHERE user_id = ?");
  const returned = count("SELECT COUNT(*) AS n FROM reports WHERE user_id = ? AND outcome IN ('returned','rejected')");
  const switches = count("SELECT COUNT(*) AS n FROM reports WHERE user_id = ? AND switched_from_slug IS NOT NULL AND switched_from_slug <> ''");
  const hours = count("SELECT COALESCE(SUM(hours), 0) AS n FROM locker_items WHERE user_id = ? AND status IN ('using','retired')");
  const helpful = count(
    "SELECT COUNT(*) AS n FROM helpful_votes v JOIN reports r ON r.id = v.report_id WHERE r.user_id = ?",
  );
  const scouted = count("SELECT COUNT(*) AS n FROM xp_events WHERE user_id = ? AND event_key LIKE 'compare:%'");
  const quizRight = count("SELECT COUNT(*) AS n FROM xp_events WHERE user_id = ? AND event_key LIKE 'quiz:%'");
  const finder = count("SELECT COUNT(*) AS n FROM xp_events WHERE user_id = ? AND event_key = 'finder:complete'");

  return [
    { id: "first-serve", name: "First Serve", description: "Added your first item to your locker", earned: lockerCount >= 1 },
    { id: "on-the-record", name: "On the Record", description: "Published your first tried-it report", earned: reportCount >= 1 },
    { id: "honest-return", name: "Honest Return", description: "Reported a pair you returned or rejected", earned: returned >= 1 },
    { id: "switch-hitter", name: "Switch Hitter", description: "Reported a switch from one model to another", earned: switches >= 1 },
    { id: "court-time", name: "Court Time", description: "Logged 50 hours across your locker", earned: hours >= 50 },
    { id: "helping-hand", name: "Helping Hand", description: "Received 5 helpful votes", earned: helpful >= 5 },
    { id: "scout", name: "Scout", description: "Worked through every comparison", earned: scouted >= comparisons.length },
    { id: "matched", name: "Matched", description: "Finished the Gear Match", earned: finder >= 1 },
    { id: "spec-sheet", name: "Spec Sheet", description: "Answered 5 Spec Rally questions correctly", earned: quizRight >= 5 },
  ];
}
