import type { Metadata } from "next";
import Link from "next/link";
import DiscoveryForm from "@/components/DiscoveryForm";
import { ProductImage } from "@/components/MediaFrame";
import { getPro, getProduct, productLabel, pros } from "@/lib/catalog";
import { gearBriefs, type GearPriority } from "@/lib/editorial";
import {
  compareHref,
  discoveryOptions,
  evidenceLabel,
  racquetGoals,
  shoeGoals,
} from "@/lib/discovery";
import s from "@/components/journeys.module.css";

export const metadata: Metadata = {
  title: "Find my version",
  description:
    "Start with a pro. Find two retail options, understand the tradeoff, and plan your own court test.",
};
type Params = {
  pro?: string;
  category?: string;
  goal?: string;
  line?: string;
  surface?: string;
};
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const q = await searchParams;
  const pro = getPro(q.pro ?? "");
  const category = q.category === "shoe" ? "shoe" : "racquet";
  const goals = category === "shoe" ? shoeGoals : racquetGoals;
  const goal = goals.find((g) => g.value === q.goal)?.value ?? goals[0].value;
  const line =
    q.line === "womens" || (!q.line && pro?.tour === "WTA") ? "womens" : "mens";
  const surface = q.surface === "clay" ? "clay" : "hard";
  const ready = !!pro && !!q.goal && goals.some((g) => g.value === q.goal);
  const options = ready
    ? discoveryOptions({
        proSlug: pro.slug,
        category,
        goal: goal as GearPriority,
        line,
        surface,
      })
    : [];
  const bag = pro?.bag.find(
    (b) => b.slot === (category === "shoe" ? "Shoes" : "Racquet"),
  );
  const reference = getProduct(bag?.productSlug ?? "");
  return (
    <div className="wrap page">
      <div className={s.intro}>
        <span className="eyebrow">Their inspiration. Your next keeper.</span>
        <h1>Find my version.</h1>
        <p className="lede">
          Start with a player you love. Leave with two options to investigate, a
          tradeoff you understand, and a test for your next hit.
        </p>
        <p className="small muted">
          No account needed. Editorial starting points, not a prediction of fit
          or playing level.
        </p>
      </div>
      <DiscoveryForm
        players={pros.map(({ slug, name }) => ({ slug, name }))}
        proSlug={pro?.slug ?? ""}
        category={category}
        goal={goal}
        line={line}
        surface={surface}
      />
      {ready && (
        <section
          id="shortlist"
          className="stack-lg"
          aria-labelledby="shortlist-title"
          tabIndex={-1}
        >
          <div className="stack">
            <span className="eyebrow">Inspired by {pro.name}</span>
            <h2 id="shortlist-title">
              {goals.find((g) => g.value === goal)?.label}: your shortlist.
            </h2>
          </div>
          <details className="card stack">
            <summary className="tap-link">
              How this connects to {pro.name}
            </summary>
            <p>
              {reference ? (
                <>
                  The bag links to{" "}
                  <Link href={`/gear/${reference.slug}`}>
                    {productLabel(reference)}
                  </Link>
                  {bag?.familyAlternative
                    ? " as an alternative within the endorsed family"
                    : " as a retail reference"}
                  .{" "}
                </>
              ) : (
                <>
                  We have not verified a{" "}
                  {category === "shoe" ? "shoe" : "racquet"} reference for this
                  player.{" "}
                </>
              )}
              Your shortlist follows{" "}
              <strong>
                {goals.find((g) => g.value === goal)?.label.toLowerCase()}
              </strong>
              {category === "shoe"
                ? `, ${line === "mens" ? "men's" : "women's"} sizing and ${surface} court`
                : ""}
              . It can differ from the pro's gear.
            </p>
            <p className="small muted">
              {pro.caveat}{" "}
              <Link href={`/pros/${pro.slug}`}>Check the bag evidence →</Link>
            </p>
          </details>
          <p role="status">
            {options.length === 2
              ? "Two starting points. Choose the compromise you would rather test."
              : options.length === 1
                ? "One supported option for this combination. Check its evidence before trying it."
                : "We do not have enough reviewed options for this combination yet. Try another priority or browse the catalog."}
          </p>
          <div className={`${s.grid} ${s.pair}`}>
            {options.map((p, i) => {
              const brief = gearBriefs[p.slug];
              return (
                <article key={p.slug} className="card stack">
                  <ProductImage product={p} ratio="1 / 1">
                    <span className="eyebrow">
                      Option {i + 1} · {evidenceLabel(p.slug)}
                    </span>
                    <h3>
                      <Link href={`/gear/${p.slug}`}>{productLabel(p)}</Link>
                    </h3>
                  </ProductImage>
                  <p>
                    <strong>Why try it:</strong> {brief.suits}
                  </p>
                  <p>
                    <strong>The compromise:</strong> {brief.cautions[0]}
                  </p>
                  <details className="stack">
                    <summary className="tap-link">Your court test →</summary>
                    <p>{brief.tryThis}</p>
                  </details>
                  <Link className="btn" href={`/gear/${p.slug}`}>
                    Read evidence &amp; save
                  </Link>
                </article>
              );
            })}
          </div>
          {options.length === 2 && (
            <Link
              className="btn btn-primary"
              href={compareHref(options[0].slug, options[1].slug)}
            >
              Compare these two →
            </Link>
          )}
          {category === "shoe" && surface === "clay" && (
            <p className="small muted">
              Clay coverage is limited. Hard-court playtests are excluded;
              manufacturer positioning alone does not establish clay traction.
            </p>
          )}
        </section>
      )}
      <div className="callout">
        <h2>Already have a baseline?</h2>
        <p>Start with what you use now to investigate a specific change.</p>
        <Link href="/switch" className="tap-link">
          Compare against my current gear →
        </Link>
      </div>
    </div>
  );
}
