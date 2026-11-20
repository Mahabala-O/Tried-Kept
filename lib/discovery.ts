import {
  getPro,
  getProduct,
  products,
  productLabel,
  pros,
  type BagItem,
  type Category,
  isComparable,
  type Product,
} from "./catalog";
import { gearBriefs, type GearPriority } from "./editorial";
import { racquetFacts } from "./catalog-expansion";

import { shoeGoals, racquetGoals } from "./gear-goals";
export { shoeGoals, racquetGoals } from "./gear-goals";

export function bagDateLabel(item: BagItem) {
  return item.evidenceType === "brand-listed"
    ? "Brand listing checked"
    : item.evidenceType === "retail-reference"
      ? "Retail reference checked"
      : "Reported";
}
export function evidenceLabel(slug: string): string {
  const kinds = gearBriefs[slug]?.evidence.map((e) => e.kind) ?? [];
  if (kinds.includes("Independent lab") && kinds.includes("Retailer playtest"))
    return "Lab + retail playtest";
  if (kinds.includes("Independent lab")) return "Independent lab";
  if (kinds.includes("Retailer playtest")) return "Retailer playtest";
  return kinds.length ? "Manufacturer only" : "Advice not yet reviewed";
}
/** This is a count of linked references in our selected profiles, not usage,
 * sales, rankings or a census of either tour. Family alternatives are excluded. */
export function trackedReferences(category: Category) {
  return products
    .filter((p) => p.category === category)
    .map((product) => ({
      product,
      players: pros.filter((pro) =>
        pro.bag.some(
          (b) => b.productSlug === product.slug && !b.familyAlternative,
        ),
      ),
    }))
    .filter((x) => x.players.length)
    .sort(
      (a, b) =>
        b.players.length - a.players.length ||
        productLabel(a.product).localeCompare(productLabel(b.product)),
    );
}
const pairs: Partial<Record<GearPriority, string[]>> = {
  power: ["babolat-pure-drive-2025", "yonex-ezone-98-2025"],
  spin: ["babolat-pure-aero-98-gen9", "yonex-vcore-98-2026"],
  control: ["tecnifibre-tfight-305s", "wilson-blade-98-16x19-v10"],
  handling: ["wilson-clash-100-v3", "head-gravity-mp-2025"],
};
export function discoveryOptions({
  proSlug,
  category,
  goal,
  line,
  surface,
}: {
  proSlug: string;
  category: Category;
  goal: GearPriority;
  line: "mens" | "womens";
  surface: "hard" | "clay";
}): Product[] {
  const pro = getPro(proSlug);
  if (!pro) return [];
  const validGoals = category === "racquet" ? racquetGoals : shoeGoals;
  if (!validGoals.some((g) => g.value === goal)) return [];
  const seed = pro.bag.find(
    (b) => b.slot === (category === "racquet" ? "Racquet" : "Shoes"),
  );
  const sizing = line === "mens" ? "Men's" : "Women's";
  const eligible = products
    .filter(
      (p) =>
        p.category === category &&
        gearBriefs[p.slug]?.priorities.includes(goal),
    )
    .filter(
      (p) =>
        category === "racquet" || (p.line === sizing && p.surface === surface),
    );
  const preferred = pairs[goal] ?? [];
  return eligible
    .sort((a, b) => {
      const rank = (p: Product) =>
        p.slug === seed?.productSlug && !seed.familyAlternative
          ? -1
          : preferred.includes(p.slug)
            ? preferred.indexOf(p.slug)
            : 100;
      return (
        rank(a) - rank(b) ||
        Number(evidenceLabel(a.slug) === "Manufacturer only") -
          Number(evidenceLabel(b.slug) === "Manufacturer only") ||
        a.slug.localeCompare(b.slug)
      );
    })
    .slice(0, 2);
}
export function compareHref(left: string, right: string) {
  return `/gear/compare?${new URLSearchParams({ left, right })}`;
}
export function comparablePair(
  left?: string,
  right?: string,
): [Product, Product] | null {
  const a = getProduct(left ?? ""),
    b = getProduct(right ?? "");
  return a && b && a.slug !== b.slug && a.category === b.category && isComparable(a.category)
    ? [a, b]
    : null;
}
export function frameFact(slug: string, key: "head" | "mass" | "pattern") {
  const f = racquetFacts[slug];
  return !f
    ? null
    : key === "head"
      ? `${f.head} in²`
      : key === "mass"
        ? `${f.mass} g · ${f.massBasis.toLowerCase()}`
        : f.pattern;
}
