import { describe, expect, it } from "vitest";
import { paginate } from "@/lib/pagination";
import {
  getPro,
  isComparable,
  missingFacts,
  products,
  pros,
} from "@/lib/catalog";
import { comparablePair } from "@/lib/discovery";
import { sponsorships } from "@/lib/sponsorships";

describe("complete directory pages", () => {
  it("fills earlier pages and returns each pro exactly once", () => {
    const pages = Array.from({ length: paginate(pros).pages }, (_, i) =>
      paginate(pros, String(i + 1)),
    );
    for (const page of pages.slice(0, -1)) expect(page.items).toHaveLength(12);
    expect(pages.flatMap((p) => p.items)).toEqual(pros);
    expect(
      new Set(pages.flatMap((p) => p.items.map((pro) => pro.slug))).size,
    ).toBe(pros.length);
    expect(pages.at(-1)!.end).toBe(pros.length);
  });
  it("clamps malformed and out-of-range pages without skipping results", () => {
    for (const value of [undefined, "garbage", "Infinity", "-4", "0"])
      expect(paginate(pros, value).page).toBe(1);
    expect(paginate(pros, "999").page).toBe(paginate(pros).pages);
    expect(paginate([], "5")).toMatchObject({
      page: 1,
      pages: 1,
      items: [],
      start: 0,
      end: 0,
    });
  });
});
describe("new clothing and socks", () => {
  it("keeps apparel out of equipment comparisons and shoe-only missing facts", () => {
    const apparel = products.filter(
      (p) => p.category === "clothing" || p.category === "sock",
    );
    expect(apparel.length).toBeGreaterThanOrEqual(6);
    for (const item of apparel) {
      expect(isComparable(item.category)).toBe(false);
      expect(missingFacts(item)).not.toContain("weight");
      expect(missingFacts(item)).not.toContain("court surface");
      expect(item.offers.length).toBeGreaterThan(0);
      expect(item.specs.some((spec) => /fabric/i.test(spec.label))).toBe(true);
    }
    const socks = apparel.filter((p) => p.category === "sock");
    expect(comparablePair(socks[0].slug, socks[1].slug)).toBeNull();
  });
});
describe("sponsorship reporting", () => {
  it("keeps estimates distinct from undisclosed financial terms", () => {
    for (const [slug, facts] of Object.entries(sponsorships)) {
      expect(getPro(slug), slug).toBeDefined();
      for (const fact of facts) {
        expect(fact.source.url).toMatch(/^https:\/\//);
        expect(fact.datedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (fact.valueStatus === "reported") {
          expect(fact.value).toContain("US$");
          expect(fact.value).toMatch(/per year|over 10 years/);
        } else expect(fact.value).toMatch(/not disclosed/i);
      }
    }
  });
});
