import type { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { comparisons } from "@/lib/catalog";
import { openDb } from "@/lib/db";
import { LEVELS, XP, awardXp, badgesFor, levelFor, reportXp, totalXp } from "@/lib/gamification";
import { addReport, addUser } from "./helpers";

describe("levelFor", () => {
  it.each([
    [0, "Ball Kid"],
    [49, "Ball Kid"],
    [50, "Club Rookie"],
    [149, "Club Rookie"],
    [150, "Baseliner"],
    [299, "Baseliner"],
    [300, "Net Rusher"],
    [599, "Net Rusher"],
    [600, "Tiebreaker"],
    [999, "Tiebreaker"],
    [1000, "Match Point"],
    [50000, "Match Point"],
  ])("puts %d XP at %s", (xp, name) => {
    expect(levelFor(xp).name).toBe(name);
  });

  it("reports progress toward the next level", () => {
    const level = levelFor(100);
    expect(level.progress).toBe(0.5);
    expect(level.next?.name).toBe("Baseliner");
  });

  it("starts each level at zero progress", () => {
    for (const level of LEVELS.slice(0, -1)) expect(levelFor(level.minXp).progress).toBe(0);
  });

  it("never reports negative progress", () => {
    expect(levelFor(-10).progress).toBe(0);
  });

  it("has no next level at the top", () => {
    const top = levelFor(1000);
    expect(top.next).toBeNull();
    expect(top.progress).toBe(1);
  });
});

describe("reportXp", () => {
  const full = {
    size: "10",
    width: "D",
    surface: "hard",
    hours: 20,
    felt_different: "More room at the toe",
    reason: "Heel slipped on hard stops",
    wear_location: "Toe drag",
    switched_from_slug: "nike-vapor-pro-2",
  };

  it("pays the base amount for a report with no details", () => {
    expect(reportXp({})).toBe(XP.reportBase);
  });

  it("pays for each filled detail", () => {
    expect(reportXp({ size: "10" })).toBe(XP.reportBase + XP.reportDetail);
    expect(reportXp(full)).toBe(XP.reportBase + 8 * XP.reportDetail);
  });

  it("does not pay for blank or null details", () => {
    expect(reportXp({ size: "", width: "", hours: null, switched_from_slug: null })).toBe(XP.reportBase);
  });

  it("counts zero hours as a stated detail", () => {
    expect(reportXp({ hours: 0 })).toBe(XP.reportBase + XP.reportDetail);
  });

  it("pays nothing extra for one-character filler", () => {
    const filler = { size: "x", width: "x", felt_different: "x", reason: "x", wear_location: "x" };
    expect(reportXp(filler)).toBe(XP.reportBase);
  });

  it("pays a fully detailed racquet report the same as a shoe report", () => {
    const racquet = {
      category: "racquet" as const,
      size: "4 3/8",
      surface: "hard",
      hours: 20,
      felt_different: "More stable on off-center hits",
      reason: "Arm felt better after long sessions",
      string_setup: "Poly 17 gauge at 52 lb",
      switched_from_slug: "yonex-ezone-98-2022",
    };
    expect(reportXp(racquet)).toBe(reportXp(full));
  });

  it("ignores width and wear on a racquet", () => {
    expect(reportXp({ category: "racquet", width: "wide", wear_location: "toe" })).toBe(XP.reportBase);
  });

  it("pays for string setup only on a racquet", () => {
    expect(reportXp({ category: "shoe", string_setup: "Poly 17 at 52 lb" })).toBe(XP.reportBase);
  });

  it("pays the same whatever the outcome or comfort score", () => {
    const kept = { ...full, outcome: "kept", comfort: 5 };
    const returned = { ...full, outcome: "returned", comfort: 1 };
    expect(reportXp(kept)).toBe(reportXp(returned));
  });
});

describe("with a database", () => {
  let db: DatabaseSync;
  let userId: number;
  const earned = (id = userId) => badgesFor(db, id).filter((b) => b.earned).map((b) => b.id);

  beforeEach(() => {
    db = openDb(":memory:");
    userId = addUser(db, "player");
  });

  describe("awardXp and totalXp", () => {
    it("starts at zero", () => {
      expect(totalXp(db, userId)).toBe(0);
    });

    it("pays an event key only once", () => {
      expect(awardXp(db, userId, "signup", XP.signup)).toBe(true);
      expect(awardXp(db, userId, "signup", XP.signup)).toBe(false);
      expect(totalXp(db, userId)).toBe(XP.signup);
    });

    it("keeps the first amount when a key is replayed with more points", () => {
      awardXp(db, userId, "signup", 10);
      awardXp(db, userId, "signup", 9999);
      expect(totalXp(db, userId)).toBe(10);
    });

    it("adds up different event keys", () => {
      awardXp(db, userId, "signup", 10);
      awardXp(db, userId, "compare:vapor-12-vs-vapor-pro-3", 5);
      expect(totalXp(db, userId)).toBe(15);
    });

    it("tracks each user separately", () => {
      const other = addUser(db, "other");
      expect(awardXp(db, userId, "signup", 10)).toBe(true);
      expect(awardXp(db, other, "signup", 10)).toBe(true);
      awardXp(db, other, "finder:complete", 15);
      expect(totalXp(db, userId)).toBe(10);
      expect(totalXp(db, other)).toBe(25);
    });
  });

  describe("badgesFor", () => {
    it("gives a new account no badges", () => {
      expect(badgesFor(db, userId)).toHaveLength(9);
      expect(earned()).toEqual([]);
    });

    it("earns First Serve from a locker row", () => {
      db.prepare("INSERT INTO locker_items (user_id, product_slug, status) VALUES (?, 'nike-vapor-12', 'using')").run(userId);
      expect(earned()).toEqual(["first-serve"]);
    });

    it("earns On the Record from any outcome", () => {
      addReport(db, userId, "kept");
      expect(earned()).toEqual(["on-the-record"]);
    });

    it.each(["returned", "rejected"] as const)("earns Honest Return from a %s report", (outcome) => {
      addReport(db, userId, outcome);
      expect(earned()).toContain("honest-return");
    });

    it.each(["kept", "testing"] as const)("does not earn Honest Return from a %s report", (outcome) => {
      addReport(db, userId, outcome);
      expect(earned()).not.toContain("honest-return");
    });

    it("earns Switch Hitter from a report with a previous model", () => {
      addReport(db, userId, "kept", "nike-vapor-pro-2");
      expect(earned()).toContain("switch-hitter");
    });

    it("does not earn Switch Hitter from an empty previous model", () => {
      addReport(db, userId, "kept", "");
      expect(earned()).not.toContain("switch-hitter");
    });

    it("earns Court Time at 50 locker hours", () => {
      const insert = db.prepare("INSERT INTO locker_items (user_id, product_slug, status, hours) VALUES (?, ?, 'using', ?)");
      insert.run(userId, "nike-vapor-12", 30);
      insert.run(userId, "nike-vapor-pro-3", 19);
      expect(earned()).not.toContain("court-time");
      insert.run(userId, "asics-gel-resolution-9", 1);
      expect(earned()).toContain("court-time");
    });

    it("does not count wishlist hours toward Court Time", () => {
      db.prepare("INSERT INTO locker_items (user_id, product_slug, status, hours) VALUES (?, 'nike-vapor-12', 'want', 50)").run(userId);
      expect(earned()).not.toContain("court-time");
    });

    it("earns Helping Hand at 5 votes on the user's own reports", () => {
      const reportId = addReport(db, userId, "kept");
      const vote = db.prepare("INSERT INTO helpful_votes (report_id, user_id) VALUES (?, ?)");
      for (let i = 0; i < 4; i++) vote.run(reportId, addUser(db, `voter${i}`));
      expect(earned()).not.toContain("helping-hand");
      const fifth = addUser(db, "voter4");
      vote.run(reportId, fifth);
      expect(earned()).toContain("helping-hand");
      expect(earned(fifth)).not.toContain("helping-hand");
    });

    it("earns Scout only after every comparison", () => {
      const [last, ...rest] = comparisons;
      for (const c of rest) awardXp(db, userId, `compare:${c.slug}`, XP.comparisonScouted);
      expect(earned()).not.toContain("scout");
      awardXp(db, userId, `compare:${last.slug}`, XP.comparisonScouted);
      expect(earned()).toContain("scout");
    });

    it("earns Matched from finishing the finder", () => {
      awardXp(db, userId, "finder:complete", XP.finderComplete);
      expect(earned()).toEqual(["matched"]);
    });

    it("earns Spec Sheet at 5 correct answers", () => {
      for (let i = 0; i < 4; i++) awardXp(db, userId, `quiz:q${i}`, XP.quizCorrect);
      expect(earned()).not.toContain("spec-sheet");
      awardXp(db, userId, "quiz:q4", XP.quizCorrect);
      expect(earned()).toContain("spec-sheet");
    });

    it("does not count another user's rows", () => {
      const other = addUser(db, "other");
      addReport(db, other, "returned", "nike-vapor-pro-2");
      awardXp(db, other, "finder:complete", XP.finderComplete);
      expect(earned()).toEqual([]);
    });

    it("gives no XP or badge for retailer clicks", () => {
      db.prepare("INSERT INTO affiliate_clicks (offer_id, user_id) VALUES ('nike-vapor-12-nike', ?)").run(userId);
      expect(totalXp(db, userId)).toBe(0);
      expect(earned()).toEqual([]);
    });
  });
});
