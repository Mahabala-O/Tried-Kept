import Pagination from "@/components/Pagination";
import { paginate } from "@/lib/pagination";
import StoryCard from "@/components/StoryCard";
import { gearStories } from "@/lib/editorial";
import { trackedReferences } from "@/lib/discovery";
import type { Metadata } from "next";
import Link from "next/link";
import { ProImage } from "@/components/MediaFrame";
import { GapNote } from "@/components/ui";
import { getProduct, productLabel, pros, type Pro } from "@/lib/catalog";
import s from "./pros.module.css";
import { prosMetadata, type SearchQuery } from "@/lib/seo";
import PageSchema from "@/components/StructuredData";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchQuery>;
}): Promise<Metadata> {
  return prosMetadata(await searchParams);
}

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
  const result = paginate(matches, query.page);
  const { page, pages, items: visible } = result;
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
      <PageSchema kind="pros" query={query} />
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
            Explore the gear linked to your favourite pros. See what’s
            confirmed, then find a version for your own game.
          </p>
          <div className={s.heroStats}>
            <span className="sticker sticker-xp sticker-plain tilt-left">
              {pros.length} {pros.length === 1 ? "pro" : "pros"}
            </span>
            <span className="sticker sticker-paper sticker-plain tilt-right">
              {datedCount} gear links with dates
            </span>
          </div>
        </div>
      </section>

      <div className="wrap page">
        {pros.length === 0 && (
          <GapNote>No pro gear has been recorded yet.</GapNote>
        )}

        <form action="/pros#players" className="stack" key={`${q}:${tour}`}>
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
        <div id="players" className={`stack ${s.resultsStart}`} tabIndex={-1}>
          <p role="status">
            Showing {result.start}–{result.end} of {matches.length} players
          </p>
        </div>
        {matches.length === 0 && (
          <p>No player matches. Try another name or clear the filters.</p>
        )}
        <div className={s.proGrid} aria-label="Players">
          {visible.map((pro) => (
            <ProCard key={pro.slug} pro={pro} />
          ))}
        </div>
        <Pagination
          page={page}
          pages={pages}
          href={href}
          label="Player pages"
        />
        <details className="card stack">
          <summary className="tap-link">
            Which gear appears in these pro profiles?
          </summary>
          <p className="small muted">
            These counts cover only the {pros.length} profiles here, checked
            November 19, 2026. They include gear named by brands or reported in
            the linked sources. Shop models from the same range are left out
            when we can’t confirm the exact pro model. Use this to explore the
            profiles, rather than judge what’s most popular across the whole
            tour.
          </p>
          {(["racquet", "shoe"] as const).map((category) => (
            <div className="stack" key={category}>
              <h2>
                {category === "racquet"
                  ? "Racquets linked to these pros"
                  : "Shoes linked to these pros"}
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

function ProCard({ pro }: { pro: Pro }) {
  const brands = [
    ...new Set(
      pro.bag.flatMap((item) => {
        const product = item.productSlug
          ? getProduct(item.productSlug)
          : undefined;
        return product ? [product.brand] : [];
      }),
    ),
  ];
  return (
    <article className={`card ${s.proCard}`} data-pro-card={pro.slug}>
      <ProImage slug={pro.slug} prefer="photo" ratio="1 / 1" />
      <p className="small muted">{pro.tour}</p>
      <h3 className={s.proName}>
        <Link href={`/pros/${pro.slug}`}>{pro.name}</Link>
      </h3>
      <p className={`small muted ${s.brandSummary}`}>
        {brands.length
          ? `Gear references: ${brands.join(" · ")}`
          : "Equipment not yet documented"}
      </p>
      <Link
        href={`/pros/${pro.slug}`}
        className="btn btn-primary"
        aria-label={`View ${pro.name}’s profile`}
      >
        View profile →
      </Link>
    </article>
  );
}
