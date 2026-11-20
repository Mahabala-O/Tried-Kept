import { describe, expect, it } from "vitest";
import { products } from "@/lib/catalog";
import {
  customerAverage,
  customerGuidance,
  customerReviewLabel,
  performanceScores,
  performanceSummary,
  ratingCoverage,
  ratingOutOf100,
  ratingsFor,
  sampleLabel,
  shoeRatings,
  type ShoeRating,
} from "@/lib/shoe-ratings";

const fixture = (overrides: Partial<ShoeRating> = {}): ShoeRating => ({
  id: "test",
  productSlug: "shoe",
  publisher: "Shop",
  url: "https://example.com/shoe",
  kind: "customer",
  value: 4,
  scale: 5,
  sampleSize: 10,
  sampleUnit: "reviews",
  scope: "Men’s hard court",
  match: "matched",
  poolId: "one",
  checkedOn: "2026-11-20",
  notes: "",
  metrics: [],
  ...overrides,
});

describe("shoe-rating arithmetic", () => {
  it("converts native scores without implying a satisfaction percentage", () => {
    expect(ratingOutOf100(4, 5)).toBe(80);
    expect(ratingOutOf100(8.7, 10)).toBeCloseTo(87);
    expect(ratingOutOf100(90, 100)).toBe(90);
    for (const [value, scale] of [
      [NaN, 5],
      [4, 0],
      [6, 5],
      [-1, 5],
      [4, Infinity],
    ])
      expect(ratingOutOf100(value, scale)).toBeNull();
  });
  it("weights scores by review entries instead of giving a single review equal influence", () => {
    const result = customerAverage([
      fixture(),
      fixture({ poolId: "two", value: 5, sampleSize: 1 }),
    ])!;
    expect(result.reviewCount).toBe(11);
    expect(result.outOf5).toBeCloseTo(45 / 11);
    expect(result.sourceCount).toBe(2);
  });
  it("never pools editorials, publishers, other variants, unknown or invalid sample sizes", () => {
    const excluded = [
      fixture({ kind: "playtest" }),
      fixture({ kind: "publisher" }),
      fixture({ match: "context" }),
      ...[null, 0, -1, 2.5, NaN, Infinity].map((sampleSize) =>
        fixture({ sampleSize }),
      ),
      fixture({ value: 8 }),
    ];
    expect(customerAverage(excluded)).toBeNull();
    expect(customerAverage([fixture(), ...excluded])?.reviewCount).toBe(10);
  });
  it("counts one canonical observation per shared pool and keeps the latest valid snapshot", () => {
    const latest = fixture({
      value: 5,
      sampleSize: 12,
      checkedOn: "2026-11-21",
    });
    expect(
      customerAverage([fixture(), latest, fixture({ id: "colour-alias" })]),
    ).toMatchObject({ outOf5: 5, reviewCount: 12, sourceCount: 1 });
    expect(customerAverage([latest, fixture()])?.reviewCount).toBe(12);
  });
  it("rejects a mixed-product aggregate", () => {
    expect(
      customerAverage([fixture(), fixture({ productSlug: "another-shoe" })]),
    ).toBeNull();
  });
  it("keeps unavailable N distinct from zero reviews", () => {
    expect(sampleLabel(fixture({ sampleSize: null }))).toBe(
      "Review count not shared",
    );
    expect(sampleLabel(fixture({ kind: "playtest", sampleSize: null }))).toBe(
      "Tester count not shared",
    );
    expect(sampleLabel(fixture({ sampleSize: 1 }))).toBe("1 customer review");
    expect(sampleLabel(fixture({ kind: "playtest", sampleSize: 4 }))).toBe(
      "Tested by 4 players",
    );
  });
});

describe("everyday explanations of the analysis", () => {
  it("explains the review count with familiar units", () => {
    const average = customerAverage([
      fixture(),
      fixture({ poolId: "two", sampleSize: 77 }),
    ])!;
    expect(customerReviewLabel(average)).toBe(
      "Based on 87 reviews across 2 sites",
    );
    expect(
      customerReviewLabel(customerAverage([fixture({ sampleSize: 1 })])!),
    ).toBe("Based on 1 review from 1 site");
  });
  it("gives sparse reviews an early-feedback prompt, without inventing confidence", () => {
    expect(customerGuidance([fixture({ sampleSize: 2 })])?.title).toBe(
      "Only a few reviews so far",
    );
    expect(customerGuidance([fixture({ sampleSize: 9 })])?.title).toBe(
      "Only a few reviews so far",
    );
    expect(customerGuidance([fixture({ sampleSize: 10 })])?.title).toBe(
      "One site’s view",
    );
    expect(customerGuidance([fixture({ match: "context" })])).toBeNull();
  });
  it("describes disagreement between site averages without treating it as a shoe defect", () => {
    const result = customerGuidance([
      fixture(),
      fixture({ poolId: "two", value: 90, scale: 100 }),
    ]);
    expect(result?.title).toBe("Ratings vary by site");
    expect(result?.detail).toContain("4.0 to 4.5 out of 5");
    expect(
      customerGuidance([fixture(), fixture({ poolId: "two", value: 4.4 })])
        ?.title,
    ).toBe("Similar ratings across sites");
  });
  it("does not manufacture agreement from a duplicate pool or expert score", () => {
    expect(
      customerGuidance([
        fixture(),
        fixture({ value: 5 }),
        fixture({ kind: "playtest", poolId: "panel", value: 5 }),
      ])?.title,
    ).toBe("One site’s view");
  });
  it("explains feature scores and compares them only within the matching on-court test", () => {
    const review = fixture({
      kind: "playtest",
      metrics: [
        { label: "Traction", value: 9, scale: 10 },
        { label: "Outsole durability", value: 80, scale: 100 },
      ],
    });
    expect(performanceScores(review)[0]).toMatchObject({
      label: "Grip",
      meaning: "Grip when stopping and changing direction",
    });
    expect(performanceSummary(review)).toContain("grip got the highest mark");
    expect(performanceSummary(review)).toContain(
      "Sole wear scored lower in the same test",
    );
    expect(performanceSummary({ ...review, match: "context" })).toBeNull();
    expect(performanceSummary({ ...review, kind: "publisher" })).toBeNull();
  });
  it("keeps tied strengths together and avoids highlighting tiny score differences", () => {
    const review = fixture({
      kind: "playtest",
      metrics: [
        { label: "Comfort", value: 9, scale: 10 },
        { label: "Traction", value: 9, scale: 10 },
        { label: "Outsole durability", value: 8, scale: 10 },
      ],
    });
    expect(performanceSummary(review)).toContain(
      "comfort and grip got the highest marks",
    );
    expect(
      performanceSummary({
        ...review,
        metrics: [
          { label: "Comfort", value: 9, scale: 10 },
          { label: "Traction", value: 8.9, scale: 10 },
        ],
      }),
    ).toBeNull();
  });
});

describe("curated source coverage", () => {
  it("audits every catalogue shoe and never assigns shoe ratings to racquets or apparel", () => {
    const shoes = products.filter((product) => product.category === "shoe");
    expect(ratingCoverage.map((item) => item.productSlug).sort()).toEqual(
      shoes.map((shoe) => shoe.slug).sort(),
    );
    for (const product of products) {
      if (product.category === "shoe")
        expect(ratingsFor(product.slug).length).toBeGreaterThan(0);
      else expect(ratingsFor(product.slug)).toEqual([]);
    }
  });
  it("records valid scores, source scope, dates and panel provenance", () => {
    expect(new Set(shoeRatings.map((rating) => rating.id)).size).toBe(
      shoeRatings.length,
    );
    for (const rating of shoeRatings) {
      expect(rating.url).toMatch(/^https:\/\//);
      expect(rating.scope.length).toBeGreaterThan(15);
      expect(rating.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(ratingOutOf100(rating.value, rating.scale)).not.toBeNull();
      if (rating.kind === "playtest")
        expect(new Set(rating.panel).size).toBe(rating.sampleSize);
      for (const metric of rating.metrics)
        expect(ratingOutOf100(metric.value, metric.scale)).not.toBeNull();
    }
  });
  it("does not attach a padel score to the hard-court Gel Resolution 9", () => {
    expect(
      ratingsFor("asics-gel-resolution-9").find(
        (rating) => rating.publisher === "RunRepeat",
      )?.match,
    ).toBe("context");
  });
  it("does not treat standard-width playtests as evidence of the wide fit", () => {
    for (const slug of [
      "asics-gel-resolution-x-wide-womens",
      "asics-gel-resolution-x-wide-mens",
    ]) {
      expect(
        ratingsFor(slug)
          .filter((rating) => rating.kind !== "customer")
          .every((rating) => rating.match === "context"),
      ).toBe(true);
    }
    expect(
      customerAverage(ratingsFor("asics-gel-resolution-x-wide-womens")),
    ).toBeNull();
  });
  it("assigns the redirected K-Swiss listing only to Express 3", () => {
    expect(
      ratingsFor("k-swiss-hypercourt-express-2").some(
        (rating) => rating.publisher === "K-Swiss",
      ),
    ).toBe(false);
    expect(
      customerAverage(ratingsFor("k-swiss-hypercourt-express-3")),
    ).toMatchObject({ reviewCount: 87, sourceCount: 2 });
  });
});
