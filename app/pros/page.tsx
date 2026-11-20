import StoryCard from "@/components/StoryCard";
import { gearStories } from "@/lib/editorial";
import { bagDateLabel, trackedReferences } from "@/lib/discovery";
import type { Metadata } from "next";
import Link from "next/link";
import { ProImage, ProductImage } from "@/components/MediaFrame";
import { GapNote, SourceLink, formatDate } from "@/components/ui";
import {
  TOUR_LABELS,
  getProduct,
  productLabel,
  pros,
  type Pro,
  type Tour,
} from "@/lib/catalog";
import s from "./pros.module.css";

export const metadata: Metadata = {
  title: "Pros",
  description:
    "Reported pro gear and checked brand listings, with dates, evidence and retail alternatives.",
};

const RULES = [
  {
    title: "Always dated",
    text: "Reported gear and checked brand listings carry separate labels and dates.",
  },
  {
    title: "Always sourced",
    text: "Each reference links to the page behind it, so you can check the claim.",
  },
  {
    title: "Not a promise",
    text: "A pro may use a custom or different model, and may have changed gear since.",
  },
];

export default async function ProsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tour?: string; page?: string }>;
}) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const tour = query.tour === "ATP" || query.tour === "WTA" ? query.tour : "";
  const matches = pros.filter(
    (p) =>
      (!tour || p.tour === tour) &&
      p.name.toLowerCase().includes(q.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(matches.length / 8));
  const page = Math.min(
    pages,
    Math.max(1, Math.floor(Number(query.page)) || 1),
  );
  const visible = matches.slice((page - 1) * 8, page * 8);
  const href = (n: number) =>
    `/pros?${new URLSearchParams({ ...(q ? { q } : {}), ...(tour ? { tour } : {}), page: String(n) })}#players`;

  const datedCount = pros.reduce(
    (n, pro) =>
      n +
      pro.bag.filter(
        (item) => item.productSlug !== null && item.identifiedOn !== null,
      ).length,
    0,
  );

  return (
    <>
      <section
        className={`band band-hardcourt court-lines ${s.hero}`}
        aria-labelledby="pros-title"
      >
        <div className={`wrap ${s.heroCopy}`}>
          <span className="eyebrow">Pro bags</span>
          <h1 id="pros-title" className={s.heroTitle}>
            Pros
          </h1>
          <p className="lede">
            Explore reported gear and brand-listed retail references. See the
            evidence, then find a version for your own game.
          </p>
          <div className={s.heroStats}>
            <span className="sticker sticker-xp sticker-plain tilt-left">
              {pros.length} {pros.length === 1 ? "pro" : "pros"}
            </span>
            <span className="sticker sticker-paper sticker-plain tilt-right">
              {datedCount} dated references
            </span>
          </div>
        </div>
      </section>

      <div className="wrap page">
        {pros.length === 0 && (
          <GapNote>No pro gear has been recorded yet.</GapNote>
        )}

        <form action="/pros#players" className="stack">
          <div className="field">
            <label htmlFor="pro-search">Find a player</label>
            <input
              id="pro-search"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Try Osaka, Alcaraz or Djokovic"
              maxLength={80}
            />
          </div>
          <div className="field">
            <label htmlFor="pro-tour">Tour</label>
            <select name="tour" id="pro-tour" defaultValue={tour}>
              <option value="">Both tours</option>
              <option value="ATP">Men's tour (ATP)</option>
              <option value="WTA">Women's tour (WTA)</option>
            </select>
          </div>
          <div className="cta-row">
            <button type="submit" className="btn btn-primary">
              Find players
            </button>
            <Link href="/pros" className="tap-link">
              Clear filters
            </Link>
            <Link href="/gear" className="btn btn-optic">
              Explore the catalogue →
            </Link>
          </div>
        </form>
        <div id="players" className="stack" tabIndex={-1}>
          <p role="status">
            {matches.length} {matches.length === 1 ? "player" : "players"} ·
            page {page} of {pages}
          </p>
        </div>
        {matches.length === 0 && (
          <p>No player matches. Try another name or clear the filters.</p>
        )}
        {TOURS.map((tour) => {
          const list = visible.filter((pro) => pro.tour === tour);
          if (list.length === 0) return null;
          return (
            <section
              key={tour}
              className="stack"
              aria-labelledby={`tour-${tour}`}
            >
              <h2 id={`tour-${tour}`}>{TOUR_LABELS[tour]}</h2>
              <div className={s.proGrid}>
                {list.map((pro) => (
                  <ProCard key={pro.slug} pro={pro} />
                ))}
              </div>
            </section>
          );
        })}

        {pages > 1 && (
          <nav aria-label="Player pages" className="cta-row">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                className={page === n ? "chip chip-active" : "chip"}
                href={href(n)}
                aria-current={page === n ? "page" : undefined}
              >
                Page {n}
              </Link>
            ))}
          </nav>
        )}
        <details className="card stack">
          <summary className="tap-link">
            Which retail references appear in this library?
          </summary>
          <p className="small muted">
            Counts within these {pros.length} selected profiles, checked
            November 19, 2026. Includes sourced brand listings and reported
            models; excludes family alternatives. These are not tour-wide usage,
            sales or popularity rankings.
          </p>
          {(["racquet", "shoe"] as const).map((category) => (
            <div className="stack" key={category}>
              <h2>
                {category === "racquet"
                  ? "Racquet references"
                  : "Shoe references"}
              </h2>
              {trackedReferences(category)
                .slice(0, 4)
                .map(({ product, players }) => (
                  <p key={product.slug}>
                    <Link href={`/gear/${product.slug}`}>
                      {productLabel(product)}
                    </Link>{" "}
                    · {players.length} of {pros.length} profiles{" "}
                    <span className="small muted">
                      ({players.map((p) => p.name).join(", ")})
                    </span>
                  </p>
                ))}
            </div>
          ))}
        </details>
        {!q && !tour && page === 1 && (
          <section
            id="stories"
            className="stack-lg"
            aria-labelledby="stories-title"
          >
            <span className="eyebrow">From the tour</span>
            <h2 id="stories-title">The stories behind the gear</h2>
            <div className="grid">
              {gearStories.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </section>
        )}
        <section className="stack-lg" aria-labelledby="pro-rules">
          <h2 id="pro-rules">How we show pro gear</h2>
          <ol className={s.rules}>
            {RULES.map((rule, i) => (
              <li key={rule.title} className={s.rule}>
                <span className={s.ruleNum} aria-hidden="true">
                  {i + 1}
                </span>
                <div className="stack">
                  <h3>{rule.title}</h3>
                  <p className="small muted">{rule.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/disclosure" className="tap-link">
            More on evidence and dates
          </Link>
        </section>
      </div>
    </>
  );
}

const TOURS: Tour[] = ["ATP", "WTA"];

function ProCard({ pro }: { pro: Pro }) {
  const dated = pro.bag.filter(
    (item) => item.productSlug !== null && item.identifiedOn !== null,
  );
  const undated = pro.bag.filter(
    (item) => item.productSlug === null || item.identifiedOn === null,
  );
  return (
    <article className={`card ${s.proCard}`}>
      <ProImage slug={pro.slug} prefer="photo" ratio="1 / 1" />
      <h3 className={s.proName}>
        <Link href={`/pros/${pro.slug}`}>{pro.name}</Link>
      </h3>
      {dated.length === 0 && (
        <GapNote>No dated gear identification is recorded yet.</GapNote>
      )}
      <ul className={s.miniBag} aria-label={`${pro.name}'s dated gear`}>
        {dated.map((item) => {
          const product = getProduct(item.productSlug as string);
          if (!product) return null;
          return (
            <li key={item.slot} className={s.miniItem}>
              <ProductImage product={product} ratio="1 / 1">
                <div className={s.miniText}>
                  <span className={s.miniSlot}>
                    {item.slot}
                    {item.familyAlternative ? " · family alternative" : ""}
                  </span>
                  <Link href={`/gear/${product.slug}`} className={s.miniName}>
                    {productLabel(product)}
                  </Link>
                  <span className="sticker sticker-blue sticker-sm sticker-plain sticker-wrap tilt-none">
                    {bagDateLabel(item)}{" "}
                    {formatDate(item.identifiedOn as string)}
                  </span>
                  <SourceLink source={item.source} standalone />
                </div>
              </ProductImage>
            </li>
          );
        })}
        {undated.map((item) => (
          <li key={item.slot} className={`${s.miniItem} ${s.miniUnknown}`}>
            <span className={s.qTile} aria-hidden="true">
              ?
            </span>
            <div className={s.miniText}>
              <span className={s.miniSlot}>
                {item.slot}
                {item.familyAlternative ? " · family alternative" : ""}
              </span>
              <span className="small">Not identified yet</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="small muted">{pro.caveat}</p>
      <div className="cta-row">
        <Link href={`/pros/${pro.slug}`} className="btn btn-primary">
          See the full bag
        </Link>
      </div>
    </article>
  );
}
