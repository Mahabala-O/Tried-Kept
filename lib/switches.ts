import { comparisonsFor, getProduct, products, type Product } from "./catalog";
import { gearBriefs, type GearPriority } from "./editorial";

export type SwitchSuggestion = {
  product: Product;
  reason: string;
  comparisonSlug?: string;
};
/** Editorial candidates, not personalized fit predictions or a numerical best-shoe ranking. */
export function switchSuggestions(
  currentSlug: string,
  priority: GearPriority,
  line: "any" | "mens" | "womens" = "any",
  surface: "hard" | "clay" | "any" = "hard",
): SwitchSuggestion[] {
  const current = getProduct(currentSlug);
  if (!current) return [];
  const related = comparisonsFor(currentSlug);
  if (current.category === "racquet") {
    return related
      .flatMap((c) =>
        c.productSlugs
          .filter((slug) => slug !== currentSlug)
          .flatMap((slug) => {
            const p = getProduct(slug);
            return p
              ? [
                  {
                    product: p,
                    reason:
                      "A documented comparison with your current frame. Demo with the same strings and tension before deciding.",
                    comparisonSlug: c.slug,
                  },
                ]
              : [];
          }),
      )
      .filter(
        (item, index, items) =>
          items.findIndex((i) => i.product.slug === item.product.slug) ===
          index,
      )
      .slice(0, 3);
  }
  const wanted =
    line === "mens" ? "Men's" : line === "womens" ? "Women's" : null;
  return products
    .filter((p) => p.category === "shoe" && p.slug !== currentSlug)
    .filter((p) => !wanted || p.line === wanted)
    .filter((p) => surface === "any" || p.surface === surface)
    .filter((p) => gearBriefs[p.slug]?.priorities.includes(priority))
    .map((product) => {
      const comparison = related.find((c) =>
        c.productSlugs.includes(product.slug),
      );
      return {
        product,
        reason: gearBriefs[product.slug].suits,
        comparisonSlug: comparison?.slug,
      };
    })
    .sort(
      (a, b) =>
        Number(Boolean(b.comparisonSlug)) - Number(Boolean(a.comparisonSlug)) ||
        a.product.slug.localeCompare(b.product.slug),
    )
    .slice(0, 3);
}
