import Pagination from "@/components/Pagination";
import { paginate } from "@/lib/pagination";
import type { Metadata } from "next";
import Link from "next/link";
import BallArt from "@/components/art/BallArt";
import RacquetArt from "@/components/art/RacquetArt";
import ShoeArt from "@/components/art/ShoeArt";
import { ProductCard } from "@/components/ui";
import { products, type Category, type Product } from "@/lib/catalog";
import s from "./gear.module.css";
import { catalogueMetadata, type SearchQuery } from "@/lib/seo";
import PageSchema from "@/components/StructuredData";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchQuery>;
}): Promise<Metadata> {
  return catalogueMetadata(await searchParams);
}

const GROUPS: { category: Category; heading: string }[] = [
  { category: "shoe", heading: "Shoes" },
  { category: "racquet", heading: "Racquets" },
  { category: "sock", heading: "Socks" },
  { category: "clothing", heading: "Clothing" },
];

const BRANDS = [...new Set(products.map((p) => p.brand))].sort((a, b) =>
  a.localeCompare(b),
);

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Filters are plain links, so they work with no JavaScript at all. */
function gearHref(brand: string, category: string, q = "", page = 1): string {
  const query = new URLSearchParams();
  if (brand) query.set("brand", brand);
  if (q) query.set("q", q);
  if (page > 1) query.set("page", String(page));
  if (category) query.set("category", category);
  const qs = query.toString();
  return qs ? `/gear?${qs}` : "/gear";
}

function matchesFilters(
  product: Product,
  brand: string,
  category: string,
  q: string,
): boolean {
  return (
    (!brand || product.brand === brand) &&
    (!category || product.category === category) &&
    `${product.brand} ${product.name}`.toLowerCase().includes(q.toLowerCase())
  );
}

function count(brand: string, category: string, q: string): number {
  return products.filter((p) => matchesFilters(p, brand, category, q)).length;
}

function Chip({
  href,
  active,
  label,
  n,
}: {
  href: string;
  active: boolean;
  label: string;
  n: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className={active ? "chip chip-active" : "chip"}
        aria-current={active ? "page" : undefined}
      >
        {label}
        <span className={s.chipCount} aria-hidden="true">
          {n}
        </span>
        <span className="sr-only">, {plural(n, "model", "models")}</span>
      </Link>
    </li>
  );
}

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<{
    brand?: string | string[];
    category?: string | string[];
    q?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const requestedBrand = single(params.brand);
  const requestedCategory = single(params.category);
  const brand = BRANDS.includes(requestedBrand) ? requestedBrand : "";
  const category = GROUPS.some((g) => g.category === requestedCategory)
    ? requestedCategory
    : "";
  const filtered = brand !== "" || category !== "" || q !== "";

  const matches = products.filter((p) => matchesFilters(p, brand, category, q));
  const result = paginate(matches, params.page);
  const { page, pages, items: visible } = result;

  const priced = products.filter((p) => p.priceUsd !== null).length;
  const filterName = [
    brand,
    GROUPS.find((g) => g.category === category)?.heading.toLowerCase(),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <PageSchema kind="catalogue" query={params} />
      <section
        className={`band band-clay ${s.hero}`}
        aria-labelledby="gear-title"
      >
        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <span className="eyebrow">The gear wall</span>
            <h1 id="gear-title" className={s.heroTitle}>
              Catalogue
            </h1>
            <p className="lede">
              Every fact links to its source. A missing price or measurement is
              labelled, not guessed.
            </p>
            <div className={s.heroStats}>
              <span className="sticker sticker-paper sticker-plain tilt-left">
                {plural(products.length, "model", "models")}
              </span>
              <span className="sticker sticker-ink sticker-plain tilt-right">
                {plural(BRANDS.length, "brand", "brands")}
              </span>
              <span className="sticker sticker-xp sticker-plain tilt-left">
                {priced} with a checked price
              </span>
            </div>
          </div>
          <div className={s.heroArt} aria-hidden="true">
            <ShoeArt seed="gear-hero" variant={2} className={s.heroShoe} />
            <RacquetArt seed="gear-hero" tilt={22} className={s.heroRacquet} />
            <BallArt bounce className={s.heroBall} />
          </div>
        </div>
      </section>

      <div className="wrap page">
        <form
          action="/gear#models"
          className="stack"
          key={`${brand}:${category}:${q}`}
        >
          <input type="hidden" name="brand" value={brand} />
          <input type="hidden" name="category" value={category} />
          <div className="field">
            <label htmlFor="gear-search">Find a model or brand</label>
            <input
              type="search"
              id="gear-search"
              name="q"
              defaultValue={q}
              maxLength={80}
              placeholder="Try Pure Aero, Court FF or Yonex"
            />
          </div>
          <div className="cta-row">
            <button type="submit" className="btn btn-primary">
              Search gear
            </button>
            <Link href="/gear/compare" className="btn">
              Compare two models →
            </Link>
          </div>
        </form>
        <nav id="models" className={s.filters} aria-label="Filter gear">
          <div className={s.filterGroup}>
            <span className={s.filterLabel} id="filter-type">
              Type
            </span>
            <ul
              className={`chip-scroll ${s.chipList}`}
              aria-labelledby="filter-type"
            >
              <Chip
                href={gearHref(brand, "", q)}
                active={category === ""}
                label="All gear"
                n={count(brand, "", q)}
              />
              {GROUPS.map((g) => (
                <Chip
                  key={g.category}
                  href={gearHref(brand, g.category, q)}
                  active={category === g.category}
                  label={g.heading}
                  n={count(brand, g.category, q)}
                />
              ))}
            </ul>
          </div>
          <div className={s.filterGroup}>
            <span className={s.filterLabel} id="filter-brand">
              Brand
            </span>
            <ul
              className={`chip-scroll ${s.chipList}`}
              aria-labelledby="filter-brand"
            >
              <Chip
                href={gearHref("", category, q)}
                active={brand === ""}
                label="All brands"
                n={count("", category, q)}
              />
              {BRANDS.map((b) => (
                <Chip
                  key={b}
                  href={gearHref(b, category, q)}
                  active={brand === b}
                  label={b}
                  n={count(b, category, q)}
                />
              ))}
            </ul>
          </div>
          <div className={s.resultLine}>
            <p className={s.resultCount}>
              Showing {result.start}–{result.end} of {matches.length} matches ·
              page {page} of {pages}
              {filterName ? (
                <span className="muted"> · {filterName}</span>
              ) : null}
            </p>
            {filtered && (
              <Link href="/gear" className="btn">
                Clear filters
              </Link>
            )}
          </div>
        </nav>

        {visible.length === 0 && (
          <div className={`card ${s.empty}`}>
            <BallArt bounce className={s.emptyBall} />
            <h2>Nothing here yet</h2>
            <p className="muted">
              No gear in the catalog matches that brand and type yet.
            </p>
            <Link href="/gear" className="btn btn-optic">
              Show all gear
            </Link>
          </div>
        )}

        <div className="grid" aria-label="Products">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <Pagination
          page={page}
          pages={pages}
          href={(n) => `${gearHref(brand, category, q, n)}#models`}
          label="Gear pages"
        />
      </div>
    </>
  );
}
