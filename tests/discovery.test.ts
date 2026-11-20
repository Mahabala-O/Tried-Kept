import { describe, expect, it } from "vitest";
import { products, pros } from "@/lib/catalog";
import { gearBriefs } from "@/lib/editorial";
import {
  bagDateLabel,
  comparablePair,
  discoveryOptions,
  frameFact,
  racquetGoals,
  shoeGoals,
  trackedReferences,
} from "@/lib/discovery";

describe("pro-to-player shortlist", () => {
  it("makes two distinct, evidenced racquet options available for every tracked pro and goal", () => {
    for (const pro of pros)
      for (const { value: goal } of racquetGoals) {
        const pair = discoveryOptions({
          proSlug: pro.slug,
          category: "racquet",
          goal,
          line: "womens",
          surface: "clay",
        });
        expect(pair).toHaveLength(2);
        expect(pair[0].slug).not.toBe(pair[1].slug);
        for (const p of pair) {
          expect(p.category).toBe("racquet");
          expect(gearBriefs[p.slug].priorities).toContain(goal);
          expect(gearBriefs[p.slug].cautions.length).toBeGreaterThan(0);
          expect(gearBriefs[p.slug].tryThis.length).toBeGreaterThan(30);
        }
      }
  });
  it("never crosses sizing lines or surfaces to manufacture a shoe result", () => {
    for (const line of ["mens", "womens"] as const)
      for (const surface of ["hard", "clay"] as const)
        for (const { value: goal } of shoeGoals) {
          const matches = discoveryOptions({
            proSlug: "carlos-alcaraz",
            category: "shoe",
            goal,
            line,
            surface,
          });
          for (const p of matches) {
            expect(p.surface).toBe(surface);
            expect(p.line).toBe(line === "mens" ? "Men's" : "Women's");
          }
          if (line === "mens" && surface === "clay")
            expect(matches).toEqual([]);
        }
  });
  it("does not hide gaps with an unsupported category or a made-up second option", () => {
    expect(
      discoveryOptions({
        proSlug: "missing",
        category: "racquet",
        goal: "spin",
        line: "mens",
        surface: "hard",
      }),
    ).toEqual([]);
    expect(
      discoveryOptions({
        proSlug: "iga-swiatek",
        category: "shoe",
        goal: "spin",
        line: "womens",
        surface: "hard",
      }),
    ).toEqual([]);
    const clay = discoveryOptions({
      proSlug: "iga-swiatek",
      category: "shoe",
      goal: "handling",
      line: "womens",
      surface: "clay",
    });
    expect(clay.map((p) => p.slug)).toEqual([
      "asics-solution-speed-ff-4-clay-womens",
    ]);
  });
});
describe("comparison and evidence integrity", () => {
  it("only compares distinct, real models of the same category", () => {
    expect(comparablePair("missing", "nike-vapor-12")).toBeNull();
    expect(comparablePair("nike-vapor-12", "nike-vapor-12")).toBeNull();
    expect(comparablePair("nike-vapor-12", "yonex-percept-97")).toBeNull();
    expect(
      comparablePair("babolat-pure-aero-98-gen9", "yonex-vcore-98-2026"),
    ).toHaveLength(2);
  });
  it("preserves measurement basis instead of silently comparing strung and unstrung mass", () => {
    expect(frameFact("wilson-blade-98-16x19-v10", "mass")).toContain(
      "strung (retailer test)",
    );
    expect(frameFact("tecnifibre-tfight-305s", "mass")).toContain("unstrung");
    expect(frameFact("missing", "mass")).toBeNull();
  });
  it("counts selected profile references without treating family alternatives as exact-model use", () => {
    for (const category of ["racquet", "shoe"] as const)
      for (const entry of trackedReferences(category)) {
        expect(products).toContain(entry.product);
        expect(entry.players.length).toBeLessThanOrEqual(pros.length);
        for (const pro of entry.players)
          expect(
            pro.bag.some(
              (b) =>
                b.productSlug === entry.product.slug && !b.familyAlternative,
            ),
          ).toBe(true);
      }
    expect(
      trackedReferences("racquet").find(
        (e) => e.product.slug === "head-speed-mp-2026",
      ),
    ).toBeUndefined();
    expect(
      bagDateLabel(
        pros
          .find((p) => p.slug === "carlos-alcaraz")!
          .bag.find((b) => b.slot === "Racquet")!,
      ),
    ).toBe("Brand listing checked");
  });
});
