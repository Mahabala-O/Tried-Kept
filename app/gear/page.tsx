import type { Metadata } from "next";
import Link from "next/link";
import BallArt from "@/components/art/BallArt";
import RacquetArt from "@/components/art/RacquetArt";
import ShoeArt from "@/components/art/ShoeArt";
import { ProductCard } from "@/components/ui";
import { products, type Category, type Product } from "@/lib/catalog";
import s from "./gear.module.css";

export const metadata: Metadata = {
  title: "Gear",
  description: "Tennis shoes and racquets with sourced specs, labelled gaps and player reports.",
};

const GROUPS: { category: Category; heading: string }[] = [
  { category: "shoe", heading: "Shoes" },
  { category: "racquet", heading: "Racquets" },
];

const BRANDS = [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Filters are plain links, so they work with no JavaScript at all. */
function gearHref(brand: string, category: string): string {
  const query = new URLSearchParams();
  if (brand) query.set("brand", brand);
  if (category) query.set("category", category);
  const qs = query.toString();
  return qs ? `/gear?${qs}` : "/gear";
}

function count(brand: string, category: string): number {
  return products.filter((p) => (brand === "" || p.brand === brand) && (category === "" || p.category === category)).length;
}

function Chip({ href, active, label, n }: { href: string; active: boolean; label: string; n: number }) {
  return (
    <li>
      <Link href={href} className={active ? "chip chip-active" : "chip"} aria-current={active ? "page" : undefined}>
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

  const priced = products.filter((p) => p.priceUsd !== null).length;
  const filterName = [brand, GROUPS.find((g) => g.category === category)?.heading.toLowerCase()].filter(Boolean).join(" ");

  return (
    <>
      <section className={`band band-clay ${s.hero}`} aria-labelledby="gear-title">
        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <span className="eyebrow">The gear wall</span>
            <h1 id="gear-title" className={s.heroTitle}>
              Gear
            </h1>
            <p className="lede">Every fact links to its source. A missing price or measurement is labelled, not guessed.</p>
            <div className={s.heroStats}>
              <span className="sticker sticker-paper sticker-plain tilt-left">{plural(products.length, "model", "models")}</span>
              <span className="sticker sticker-ink sticker-plain tilt-right">{plural(BRANDS.length, "brand", "brands")}</span>
              <span className="sticker sticker-xp sticker-plain tilt-left">{priced} with a checked price</span>
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
        <nav className={s.filters} aria-label="Filter gear">
          <div className={s.filterGroup}>
            <span className={s.filterLabel} id="filter-type">
              Type
            </span>
            <ul className={`chip-scroll ${s.chipList}`} aria-labelledby="filter-type">
              <Chip href={gearHref(brand, "")} active={category === ""} label="All gear" n={count(brand, "")} />
              {GROUPS.map((g) => (
                <Chip
                  key={g.category}
                  href={gearHref(brand, g.category)}
                  active={category === g.category}
                  label={g.heading}
                  n={count(brand, g.category)}
                />
              ))}
            </ul>
          </div>
          <div className={s.filterGroup}>
            <span className={s.filterLabel} id="filter-brand">
              Brand
            </span>
            <ul className={`chip-scroll ${s.chipList}`} aria-labelledby="filter-brand">
              <Chip href={gearHref("", category)} active={brand === ""} label="All brands" n={count("", category)} />
              {BRANDS.map((b) => (
                <Chip key={b} href={gearHref(b, category)} active={brand === b} label={b} n={count(b, category)} />
              ))}
            </ul>
          </div>
          <div className={s.resultLine}>
            <p className={s.resultCount}>
              Showing {matches.length} of {products.length}
              {filterName ? <span className="muted"> · {filterName}</span> : null}
            </p>
            {filtered && (
              <Link href="/gear" className="btn">
                Clear filters
              </Link>
            )}
          </div>
        </nav>

        {groups.length === 0 && (
          <div className={`card ${s.empty}`}>
            <BallArt bounce className={s.emptyBall} />
            <h2>Nothing here yet</h2>
            <p className="muted">No gear in the catalog matches that brand and type yet.</p>
            <Link href="/gear" className="btn btn-optic">
              Show all gear
            </Link>
          </div>
        )}

        {groups.map((group) => (
          <section key={group.category} className="stack-lg" aria-labelledby={`group-${group.category}`}>
            <div className={s.groupHead}>
              <h2 id={`group-${group.category}`}>{group.heading}</h2>
              <span className="sticker sticker-sm sticker-paper sticker-plain tilt-right">
                {plural(group.items.length, "model", "models")}
              </span>
            </div>
            <div className="grid">
              {group.items.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
