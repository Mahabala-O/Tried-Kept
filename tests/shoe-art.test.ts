import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ShoeArt from "@/components/art/ShoeArt";
import { SHOE_MODELS } from "@/components/art/shoeModels";
import { getProduct, products } from "@/lib/catalog";

describe("shoe art", () => {
  it("has a drawing for every shoe in the catalog", () => {
    for (const p of products.filter((p) => p.category === "shoe")) expect(SHOE_MODELS[p.slug], p.slug).toBeDefined();
  });

  it("only draws shoes that exist in the catalog", () => {
    for (const slug of Object.keys(SHOE_MODELS)) expect(getProduct(slug)?.category, slug).toBe("shoe");
  });

  it("renders every model and a made-up shoe without brand text", () => {
    for (const seed of [...Object.keys(SHOE_MODELS), "decorative", 42]) {
      const svg = renderToStaticMarkup(createElement(ShoeArt, { seed }));
      expect(svg).toMatch(/^<svg/);
      expect(svg).not.toMatch(/<text/);
    }
  });
});
