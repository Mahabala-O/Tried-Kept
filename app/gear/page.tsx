import type { Metadata } from "next";
import Link from "next/link";
import { GapNote, ProductCard } from "@/components/ui";
import { products, type Category, type Product } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Gear",
  description: "Tennis shoes and racquets with sourced specs, labelled gaps and player reports.",
};

const GROUPS: { category: Category; heading: string }[] = [
  { category: "shoe", heading: "Shoes" },
  { category: "racquet", heading: "Racquets" },
];

const BRANDS = [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string | string[]; category?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedBrand = single(params.brand);
  const requestedCategory = single(params.category);
  const brand = BRANDS.includes(requestedBrand) ? requestedBrand : "";
  const category = GROUPS.some((g) => g.category === requestedCategory) ? requestedCategory : "";
  const filtered = brand !== "" || category !== "";

  const matches = products.filter(
    (p: Product) => (brand === "" || p.brand === brand) && (category === "" || p.category === category),
  );
  const groups = GROUPS.map((group) => ({
    ...group,
    items: matches.filter((p) => p.category === group.category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="wrap page">
      <div className="stack">
        <h1>Gear</h1>
        <p className="lede">Every fact links to its source. A missing price or measurement is labelled, not guessed.</p>
      </div>

      <form key={`${brand}|${category}`} action="/gear" method="get" className="card" aria-label="Filter gear">
        <div className="grid">
          <div className="field">
            <label htmlFor="filter-brand">Brand</label>
            <select id="filter-brand" name="brand" defaultValue={brand}>
              <option value="">All brands</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-category">Category</label>
            <select id="filter-category" name="category" defaultValue={category}>
              <option value="">All categories</option>
              {GROUPS.map((g) => (
                <option key={g.category} value={g.category}>
                  {g.heading}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <button type="submit" className="btn btn-primary">
            Apply filter
          </button>
          {filtered && (
            <Link href="/gear" className="btn">
              Clear filter
            </Link>
          )}
          <span className="small muted">
            Showing {matches.length} of {products.length}
          </span>
        </div>
      </form>

      {groups.length === 0 && <GapNote>No gear in the catalog matches that brand and category yet.</GapNote>}

      {groups.map((group) => (
        <section key={group.category} className="stack" aria-labelledby={`group-${group.category}`}>
          <h2 id={`group-${group.category}`}>{group.heading}</h2>
          <div className="grid">
            {group.items.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
