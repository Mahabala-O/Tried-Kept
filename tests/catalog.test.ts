import { describe, expect, it } from "vitest";
import {
  RESEARCH_DATE,
  comparisons,
  comparisonsFor,
  getComparison,
  getOffer,
  getPro,
  getProduct,
  missingFacts,
  products,
  pros,
  prosUsing,
  retailers,
  sources,
} from "@/lib/catalog";

const allOffers = products.flatMap((p) => p.offers);
const isHttps = (url: string) => new URL(url).protocol === "https:";

describe("identifiers", () => {
  it("has unique product slugs", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique offer ids", () => {
    const ids = allOffers.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique pro and comparison slugs", () => {
    expect(new Set(pros.map((p) => p.slug)).size).toBe(pros.length);
    expect(new Set(comparisons.map((c) => c.slug)).size).toBe(comparisons.length);
  });
});

describe("references", () => {
  it("resolves every comparison product", () => {
    for (const c of comparisons) {
      expect(c.productSlugs.length).toBeGreaterThanOrEqual(2);
      for (const slug of c.productSlugs) expect(getProduct(slug), `${c.slug}: ${slug}`).toBeDefined();
    }
  });

  it("resolves first-hand replies to a product in that comparison", () => {
    for (const c of comparisons) {
      for (const reply of c.firsthand) expect(c.productSlugs).toContain(reply.productSlug);
    }
  });

  it("gives each comparison row one value per product", () => {
    for (const c of comparisons) {
      for (const row of c.rows) expect(row.values, `${c.slug}: ${row.label}`).toHaveLength(c.productSlugs.length);
    }
  });

  it("resolves every pro bag product to the right category", () => {
    for (const pro of pros) {
      for (const item of pro.bag) {
        if (item.productSlug === null) continue;
        const product = getProduct(item.productSlug);
        expect(product, `${pro.slug}: ${item.productSlug}`).toBeDefined();
        expect(product?.category).toBe(item.slot === "Shoes" ? "shoe" : "racquet");
      }
    }
  });

  it("links every offer to a known retailer", () => {
    for (const offer of allOffers) expect(retailers[offer.retailerId]).toBeDefined();
  });

  it("finds records through the lookup helpers", () => {
    expect(getProduct("missing")).toBeUndefined();
    expect(getOffer("missing")).toBeUndefined();
    expect(getPro("missing")).toBeUndefined();
    expect(getComparison("missing")).toBeUndefined();
    expect(getOffer("nike-vapor-12-nike")?.product.slug).toBe("nike-vapor-12");
    expect(prosUsing("nike-vapor-12").map((p) => p.slug)).toEqual(["carlos-alcaraz"]);
    expect(prosUsing("nike-vapor-pro-3")).toEqual([]);
    expect(comparisonsFor("nike-vapor-pro-3").map((c) => c.slug)).toEqual(["vapor-12-vs-vapor-pro-3"]);
  });
});

describe("pro gear evidence", () => {
  const items = pros.flatMap((pro) => pro.bag.map((item) => ({ pro: pro.slug, item })));

  it("dates every bag item that names a product", () => {
    for (const { pro, item } of items) {
      if (item.productSlug === null) continue;
      expect(item.identifiedOn, `${pro}: ${item.productSlug}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(item.identifiedOn!))).toBe(false);
      expect(item.identifiedOn! <= RESEARCH_DATE).toBe(true);
    }
  });

  it("gives every bag item evidence and an https source", () => {
    for (const { item } of items) {
      expect(item.evidence.length).toBeGreaterThan(0);
      expect(isHttps(item.source.url)).toBe(true);
    }
  });

  it("gives every pro a caveat", () => {
    for (const pro of pros) expect(pro.caveat.length).toBeGreaterThan(0);
  });

  it("keeps pro claims out of product summaries, which show no date or caveat", () => {
    for (const product of products) {
      for (const pro of pros) expect(product.summary, product.slug).not.toContain(pro.name);
    }
  });

  it("records the Alcaraz identification date from the research", () => {
    const shoes = getPro("carlos-alcaraz")?.bag.find((b) => b.slot === "Shoes");
    expect(shoes?.productSlug).toBe("nike-vapor-12");
    expect(shoes?.identifiedOn).toBe("2026-03-13");
  });
});

describe("links and sources", () => {
  it("uses https for every offer", () => {
    expect(allOffers.length).toBeGreaterThan(0);
    for (const offer of allOffers) expect(isHttps(offer.url), offer.id).toBe(true);
  });

  it("dates every offer check", () => {
    for (const offer of allOffers) expect(offer.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses https for every source", () => {
    for (const source of Object.values(sources)) expect(isHttps(source.url), source.label).toBe(true);
  });
});

describe("labelled gaps", () => {
  it("names every missing fact on a sparse shoe", () => {
    expect(missingFacts(getProduct("mizuno-wave-exceed-tour-5")!)).toEqual([
      "U.S. price",
      "retail line (men's or women's)",
      "court surface",
      "style number",
      "interior width at the ball of the foot",
      "cushioning location",
      "weight",
    ]);
  });

  it("lists nothing for a shoe with every fact recorded", () => {
    expect(missingFacts(getProduct("nike-vapor-12")!)).toEqual([]);
  });

  it("does not ask a racquet for shoe-only facts", () => {
    const gaps = missingFacts(getProduct("yonex-ezone-98-2025")!);
    expect(gaps).not.toContain("court surface");
    expect(gaps).not.toContain("cushioning location");
    expect(gaps).not.toContain("retail line (men's or women's)");
  });
});

describe("facts from the research", () => {
  it("dates every recorded price", () => {
    for (const p of products) {
      if (p.priceUsd !== null) expect(p.priceCheckedOn, p.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("links each lab value to the test that reports it", () => {
    const rows = getComparison("vapor-12-vs-vapor-pro-3")!.rows.filter((r) => r.valueSources);
    expect(rows).toHaveLength(2);
    for (const row of rows) expect(row.valueSources).toEqual([sources.rrV12, sources.rrPro3]);
  });

  it("does not cite the crossover list for the Hypercourt models", () => {
    for (const slug of ["k-swiss-hypercourt-express-2", "k-swiss-hypercourt-express-3"]) {
      expect(getProduct(slug)!.sources).not.toContain(sources.twCrossover);
    }
    expect(getComparison("hypercourt-express-2-vs-3")!.sources).not.toContain(sources.twCrossover);
  });

  it("matches the Vapor 12", () => {
    expect(getProduct("nike-vapor-12")).toMatchObject({
      priceUsd: 180,
      sku: "FV5552-003",
      weightG: 390,
      forefootWidthMm: 89.9,
      cushioning: "heel",
    });
  });

  it("matches the Vapor Pro 3", () => {
    expect(getProduct("nike-vapor-pro-3")).toMatchObject({
      priceUsd: 135,
      sku: "FZ2161-101",
      weightG: 383,
      forefootWidthMm: 93.2,
      cushioning: "forefoot",
    });
  });

  it("backs every recorded number with a sourced spec", () => {
    for (const p of products) {
      const values = p.specs.map((s) => s.value);
      if (p.priceUsd !== null) expect(values, p.slug).toContain(`$${p.priceUsd}`);
      if (p.weightG !== null) expect(values, p.slug).toContain(`${p.weightG} g`);
      if (p.forefootWidthMm !== null) expect(values, p.slug).toContain(`${p.forefootWidthMm} mm`);
      for (const spec of p.specs) expect(isHttps(spec.source.url), `${p.slug}: ${spec.label}`).toBe(true);
    }
  });
});
