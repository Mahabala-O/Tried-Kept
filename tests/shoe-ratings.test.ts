import { describe, expect, it } from "vitest";
import { products } from "@/lib/catalog";
import {
  customerAverage,
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
    expect(sampleLabel(fixture({ sampleSize: null }))).toBe("N not published");
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
