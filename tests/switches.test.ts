import { describe, expect, it } from "vitest";
import { switchSuggestions } from "@/lib/switches";
import { getComparison, getProduct, getPro } from "@/lib/catalog";
import { gearBriefs, gearStories, proWardrobe } from "@/lib/editorial";

describe("editorial switch suggestions", () => {
  it("never includes the current model, an opposite sizing line or an unsupported surface", () => {
    for (const priority of [
      "room",
      "support",
      "cushioning",
      "durability",
    ] as const) {
      const candidates = switchSuggestions(
        "asics-gel-resolution-9",
        priority,
        "womens",
        "hard",
      );
      if (priority !== "room") expect(candidates.length).toBeGreaterThan(0);
      else expect(candidates).toEqual([]);
      for (const { product } of candidates) {
        expect(product.slug).not.toBe("asics-gel-resolution-9");
        expect(product.line).toBe("Women's");
        expect(product.surface).toBe("hard");
        expect(gearBriefs[product.slug].priorities).toContain(priority);
      }
    }
  });
  it("does not repurpose a hard-court review as a clay recommendation", () => {
    expect(
      switchSuggestions("asics-gel-resolution-9", "support", "any", "clay"),
    ).toEqual([]);
  });
  it("explains insufficient evidence rather than falling back to another category", () => {
    expect(switchSuggestions("missing", "support")).toEqual([]);
    expect(switchSuggestions("head-speed-sinner-2026", "support")).toEqual([]);
  });
  it("preserves the direct old-to-new comparison for a racquet demo", () => {
    const matches = switchSuggestions("yonex-ezone-98-2022", "support");
    expect(matches.map((m) => m.product.slug)).toEqual(["yonex-ezone-98-2025"]);
    expect(getComparison(matches[0].comparisonSlug!)?.productSlugs).toContain(
      "yonex-ezone-98-2022",
    );
  });
  it("only links to comparisons that contain both the starting and suggested products", () => {
    for (const { product, comparisonSlug } of switchSuggestions(
      "asics-gel-resolution-9",
      "room",
      "mens",
    )) {
      if (comparisonSlug)
        expect(getComparison(comparisonSlug)?.productSlugs).toEqual(
          expect.arrayContaining(["asics-gel-resolution-9", product.slug]),
        );
    }
  });
});
describe("published evidence relationships", () => {
  it("keeps pro stories separate from invented member reviews, with dated source trails", () => {
    for (const story of gearStories) {
      expect(getPro(story.proSlug)).toBeDefined();
      expect(story.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(story.limitation.length).toBeGreaterThan(30);
      for (const step of story.steps)
        expect(new URL(step.source.url).protocol).toBe("https:");
      for (const slug of story.productSlugs)
        expect(getProduct(slug)).toBeDefined();
    }
    for (const slug of Object.keys(proWardrobe))
      expect(getPro(slug)).toBeDefined();
  });
  it("gives every recommended brief a downside and attributable evidence", () => {
    for (const [slug, brief] of Object.entries(gearBriefs)) {
      expect(getProduct(slug)).toBeDefined();
      expect(brief.cautions.length).toBeGreaterThan(0);
      expect(brief.evidence.length).toBeGreaterThan(0);
      for (const item of brief.evidence)
        expect(new URL(item.source.url).protocol).toBe("https:");
    }
  });
});
