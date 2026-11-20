import { describe, expect, it } from "vitest";
import { getProduct, type Product } from "@/lib/catalog";
import { breakEvenHours, costPerHour, rankShoes, type FinderAnswers } from "@/lib/finder";

const base: FinderAnswers = { surface: "any", budget: null, fit: "unsure", cushioning: "unsure", line: "any" };
const slugs = (answers: FinderAnswers) => rankShoes(answers).map((m) => m.product.slug);

describe("rankShoes", () => {
  it("ranks Vapor Pro 3 first for $150, roomy, forefoot, hard and excludes Vapor 12", () => {
    const result = slugs({ ...base, budget: 150, fit: "roomy", cushioning: "forefoot", surface: "hard" });
    expect(result[0]).toBe("nike-vapor-pro-3");
    expect(result).not.toContain("nike-vapor-12");
  });

  it("ranks Vapor 12 first for snug and heel", () => {
    expect(slugs({ ...base, fit: "snug", cushioning: "heel" })[0]).toBe("nike-vapor-12");
  });

  it("splits the two Vapors by measured room at the ball of the foot", () => {
    expect(slugs({ ...base, fit: "roomy" })).toContain("nike-vapor-pro-3");
    expect(slugs({ ...base, fit: "roomy" })).not.toContain("nike-vapor-12");
    expect(slugs({ ...base, fit: "snug" })).toEqual(["nike-vapor-12"]);
  });

  it("treats a budget equal to the price as within budget", () => {
    const priced = (budget: number) => rankShoes({ ...base, surface: "hard", budget }).filter(m => m.product.priceUsd !== null).map(m => m.product.slug);
    expect(priced(135)).toEqual(["nike-vapor-pro-3"]);
    expect(priced(134)).toEqual([]);
    const unpriced = rankShoes({ ...base, surface: "hard", budget: 100 });
    expect(unpriced.every(m => m.unknowns.includes("Current price"))).toBe(true);
  });

  it("returns only the men's wide variant for wide and men's", () => {
    expect(slugs({ ...base, fit: "wide", line: "mens" })).toEqual(["asics-gel-resolution-x-wide-mens"]);
  });

  it("returns only the women's wide variant for wide and women's", () => {
    expect(slugs({ ...base, fit: "wide", line: "womens" })).toEqual(["asics-gel-resolution-x-wide-womens"]);
  });

  it("returns every wide variant when no line is requested", () => {
    const matches = rankShoes({ ...base, fit: "wide" });
    expect(matches).toHaveLength(2);
    expect(matches.every((m) => m.product.wideVariant)).toBe(true);
  });

  it("excludes hard-court versions on clay", () => {
    const matches = rankShoes({ ...base, surface: "clay", fit: "wide" });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => m.product.surface !== "hard")).toBe(true);
    expect(matches.every((m) => m.unknowns.includes("Clay version"))).toBe(true);
  });

  it("does not suggest the Vapor 12 on clay even when fit and cushioning match", () => {
    expect(slugs({ ...base, surface: "clay", fit: "snug", cushioning: "heel" })).toEqual([]);
  });

  it("recommends nothing when the answers give it no facts to rank on", () => {
    expect(rankShoes(base)).toEqual([]);
  });

  it("reports missing facts as unknowns instead of scoring them", () => {
    const [match] = rankShoes({ ...base, fit: "wide", line: "mens", budget: 150, surface: "hard", cushioning: "heel" });
    expect(match.score).toBe(4);
    expect(match.unknowns).toEqual(expect.arrayContaining(["Current price", "Court surface", "Cushioning location"]));
  });

  it("gives a product with no recorded facts no points", () => {
    const empty: Product = {
      ...getProduct("nike-vapor-pro-2")!,
      priceUsd: null,
      surface: null,
      forefootWidthMm: null,
      cushioning: null,
    };
    const answers: FinderAnswers = { surface: "hard", budget: 150, fit: "roomy", cushioning: "forefoot", line: "any" };
    expect(rankShoes(answers, [empty])).toEqual([]);
  });

  it("never returns a racquet", () => {
    const racquet: Product = { ...getProduct("nike-vapor-12")!, category: "racquet" };
    expect(rankShoes({ ...base, fit: "snug", cushioning: "heel" }, [racquet])).toEqual([]);
  });
});

describe("breakEvenHours", () => {
  it("matches the research example of $135 over 60 hours against $180", () => {
    expect(breakEvenHours(135, 60, 180)).toBe(80);
  });

  it.each([
    [0, 60, 180],
    [135, 0, 180],
    [135, 60, 0],
    [-135, 60, 180],
    [135, -60, 180],
    [135, 60, -180],
  ])("returns 0 for unusable input %d, %d, %d", (cheap, hours, pricier) => {
    expect(breakEvenHours(cheap, hours, pricier)).toBe(0);
  });
});

describe("costPerHour", () => {
  it("divides price by hours", () => {
    expect(costPerHour(135, 60)).toBe(2.25);
  });

  it("allows a free pair", () => {
    expect(costPerHour(0, 10)).toBe(0);
  });

  it.each([
    [null, 60],
    [135, null],
    [null, null],
    [135, 0],
    [135, -1],
    [-1, 60],
  ])("returns null for %s and %s", (price, hours) => {
    expect(costPerHour(price, hours)).toBeNull();
  });
});
