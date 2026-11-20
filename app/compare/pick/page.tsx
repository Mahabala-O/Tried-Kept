import type { Metadata } from "next";
import Link from "next/link";
import { comparisonsFor, products, productLabel } from "@/lib/catalog";
import { comparablePair, evidenceLabel, frameFact } from "@/lib/discovery";
import { gearBriefs } from "@/lib/editorial";
import { ProductImage } from "@/components/MediaFrame";
import GearEvidence from "@/components/GearEvidence";
import { SourceList } from "@/components/ui";
import s from "@/components/journeys.module.css";

export const metadata: Metadata = {
  title: "Build a comparison",
  description:
    "Compare any two shoes or retail racquets in the library, with source-specific advice and a court test.",
};
export default async function PickComparison({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const { left = "", right = "" } = await searchParams;
  const pair = comparablePair(left, right);
  const curated = pair
    ? comparisonsFor(pair[0].slug).find((c) =>
        c.productSlugs.includes(pair[1].slug),
      )
    : null;
  return (
    <div className="wrap page">
      <div className="stack">
        <Link href="/compare" className="tap-link">
          All comparison guides →
        </Link>
        <span className="eyebrow">Two options. One useful decision.</span>
        <h1>Pick your tradeoff.</h1>
        <p className="lede">
          Compare two models in the same category. Start with what changes on
          court, then test it with the same setup.
        </p>
      </div>
      <form action="/compare/pick#comparison" className={s.form}>
        {(["left", "right"] as const).map((side) => (
          <div key={side} className="field">
            <label htmlFor={`compare-${side}`}>
              {side === "left" ? "First model" : "Second model"}
            </label>
            <select
              name={side}
              id={`compare-${side}`}
              defaultValue={side === "left" ? left : right}
              required
            >
              <option value="">Choose a model</option>
              {["shoe", "racquet"].map((kind) => (
                <optgroup
                  label={kind === "shoe" ? "Shoes" : "Racquets"}
                  key={kind}
                >
                  {products
                    .filter((p) => p.category === kind)
                    .map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {productLabel(p)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        ))}
        <button className="btn btn-optic" type="submit">
          Compare models
        </button>
      </form>
      {(left || right) && !pair && (
        <p role="status" className="callout">
          Choose two different, known models in the same category.
        </p>
      )}
      {pair && (
        <section
          id="comparison"
          className="stack-lg"
          aria-labelledby="pair-title"
          tabIndex={-1}
        >
          <h2 id="pair-title">
            {pair[0].name} vs {pair[1].name}
          </h2>
          {pair[0].category === "shoe" && (
            <div className="callout">
              <p>
                Confirm the sizing line and outsole first. Measurements from
                different sizes or test methods are not directly comparable. A
                hard-court review does not establish clay performance.
              </p>
            </div>
          )}
          {pair[0].category === "racquet" && (
            <div className="callout">
              <p>
                Match strings, tension and grip size for your demo. Unstrung
                mass and a retailer's strung test mass are different
                measurements; do not rank handling from those numbers alone.
              </p>
            </div>
          )}
          <div className={`${s.grid} ${s.pair}`}>
            {pair.map((p) => (
              <article className="card stack" key={p.slug}>
                <ProductImage product={p} ratio="1 / 1">
                  <span className="eyebrow">{evidenceLabel(p.slug)}</span>
                  <h3>
                    <Link href={`/gear/${p.slug}`}>{productLabel(p)}</Link>
                  </h3>
                </ProductImage>
                {p.category === "racquet" ? (
                  <dl className={s.change}>
                    {(["head", "mass", "pattern"] as const).map((key, i) => (
                      <div key={key}>
                        <dt>
                          {
                            [
                              "Head size",
                              "Mass and measurement basis",
                              "String pattern",
                            ][i]
                          }
                        </dt>
                        <dd>{frameFact(p.slug, key) ?? "Not recorded"}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>
                    <strong>Version:</strong> {p.line ?? "Sizing not recorded"}{" "}
                    ·{" "}
                    {p.surface ? `${p.surface} court` : "surface not recorded"}
                  </p>
                )}
                {gearBriefs[p.slug] ? (
                  <>
                    <p>
                      <strong>Worth a try:</strong> {gearBriefs[p.slug].suits}
                    </p>
                    <p>
                      <strong>Watch for:</strong>{" "}
                      {gearBriefs[p.slug].cautions[0]}
                    </p>
                  </>
                ) : (
                  <p>
                    Advice for this exact version has not been reviewed yet.
                    Check the sourced facts before choosing.
                  </p>
                )}
                <Link href={`/gear/${p.slug}`} className="btn">
                  Details &amp; save to locker
                </Link>
                <Link
                  href={`/report/new?product=${p.slug}&from=${pair.find((other) => other.slug !== p.slug)!.slug}`}
                  className="tap-link"
                >
                  Tried this after the other? Record it →
                </Link>
              </article>
            ))}
          </div>
          {curated && (
            <Link href={`/compare/${curated.slug}`} className="btn btn-primary">
              Read the focused comparison guide →
            </Link>
          )}
          <h2>What to test, and why</h2>
          {pair.map((p) => (
            <div className="stack" key={p.slug}>
              <h3>{productLabel(p)}</h3>
              <GearEvidence productSlug={p.slug} />
              <SourceList sources={p.sources} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
