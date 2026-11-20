"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  comparisonsFor,
  getProduct,
  productLabel,
  products,
} from "@/lib/catalog";
import { gearBriefs, type GearPriority } from "@/lib/editorial";
import { switchSuggestions } from "@/lib/switches";
import { ProductImage } from "./MediaFrame";
import { PriceSticker } from "./ui";
import s from "./journeys.module.css";
import { racquetGoals, shoeGoals } from "@/lib/discovery";
const priorities = [...shoeGoals, ...racquetGoals];

export default function SwitchGuide({
  initialCurrent = "",
  initialPriority,
  initialLine,
  initialSurface,
}: {
  initialCurrent?: string;
  initialPriority?: string;
  initialLine?: string;
  initialSurface?: string;
}) {
  const [currentSlug, setCurrent] = useState(
    getProduct(initialCurrent) ? initialCurrent : "",
  );
  const [priority, setPriority] = useState<GearPriority>(
    priorities.some((p) => p.value === initialPriority)
      ? (initialPriority as GearPriority)
      : "support",
  );
  const [line, setLine] = useState<"any" | "mens" | "womens">(
    ["any", "mens", "womens"].includes(initialLine ?? "")
      ? (initialLine as "any" | "mens" | "womens")
      : getProduct(initialCurrent)?.line === "Women's"
        ? "womens"
        : getProduct(initialCurrent)?.line === "Men's"
          ? "mens"
          : "any",
  );
  const [surface, setSurface] = useState<"hard" | "clay" | "any">(
    ["hard", "clay", "any"].includes(initialSurface ?? "")
      ? (initialSurface as "hard" | "clay" | "any")
      : "hard",
  );
  const current = getProduct(currentSlug);
  const isRacquet = current?.category === "racquet";
  const goals = isRacquet
    ? racquetGoals
    : shoeGoals.map((g) => ({
        ...g,
        label: g.value === "room" ? "More room" : g.label,
      }));
  const activePriority = goals.some((g) => g.value === priority)
    ? priority
    : goals[0].value;
  const suggestions = switchSuggestions(
    currentSlug,
    activePriority,
    line,
    surface,
  );
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentSlug) url.searchParams.set("current", currentSlug);
    else url.searchParams.delete("current");
    url.searchParams.set("priority", activePriority);
    url.searchParams.set("line", line);
    url.searchParams.set("surface", surface);
    window.history.replaceState(null, "", url);
  }, [currentSlug, activePriority, line, surface]);
  return (
    <div className="stack-lg">
      <div className={s.form}>
        <div className="field">
          <label htmlFor="current-gear">1. What do you play with now?</label>
          <select
            id="current-gear"
            value={currentSlug}
            onChange={(e) => {
              setCurrent(e.target.value);
              const p = getProduct(e.target.value);
              setLine(
                p?.line === "Women's"
                  ? "womens"
                  : p?.line === "Men's"
                    ? "mens"
                    : "any",
              );
            }}
          >
            <option value="">Choose your current gear</option>
            {["shoe", "racquet"].map((category) => (
              <optgroup
                key={category}
                label={category === "shoe" ? "Shoes" : "Racquets"}
              >
                {products
                  .filter((p) => p.category === category)
                  .map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {productLabel(p)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <p className="small muted">
            Yours missing? <Link href="/gear">Browse the catalog</Link> or use{" "}
            <Link href="/play/finder">Gear Match</Link> without a starting
            model.
          </p>
        </div>
        <fieldset className={s.priorities}>
          <legend>2. What would you like to improve?</legend>
          {goals.map((p) => (
            <label key={p.value} className={s.priority}>
              <input
                type="radio"
                name="priority"
                value={p.value}
                checked={activePriority === p.value}
                onChange={() => setPriority(p.value)}
              />
              {p.label}
            </label>
          ))}
        </fieldset>
        {!isRacquet && (
          <>
            <div className="field">
              <label htmlFor="trial-surface">Where will you play?</label>
              <select
                id="trial-surface"
                value={surface}
                onChange={(e) => setSurface(e.target.value as typeof surface)}
              >
                <option value="hard">Hard court</option>
                <option value="clay">Clay</option>
                <option value="any">Explore any recorded surface</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="retail-line">Retail sizing</label>
              <select
                id="retail-line"
                value={line}
                onChange={(e) => setLine(e.target.value as typeof line)}
              >
                <option value="any">Any recorded sizing line</option>
                <option value="womens">Women's</option>
                <option value="mens">Men's</option>
              </select>
            </div>
          </>
        )}
      </div>
      <p role="status" className="small muted">
        {current
          ? `${suggestions.length} ${suggestions.length === 1 ? "candidate" : "candidates"} to investigate from ${productLabel(current)}. These are editorial starting points; fit and improvement are not established.`
          : "Choose a starting model to see relevant candidates and comparisons."}
      </p>
      {current && (
        <section className={s.shortlist} aria-labelledby="candidates-title">
          <h2 id="candidates-title">
            {isRacquet
              ? "Compare, then demo"
              : "Try these questions on for size"}
          </h2>
          {suggestions.length === 0 && (
            <div className="callout">
              <p>
                We don’t have enough reviewed options for this combination yet.
                Keep your current pair as the baseline; try another priority or
                explore all gear.
              </p>
              <Link href="/gear" className="tap-link">
                Explore the catalog
              </Link>
            </div>
          )}
          {suggestions.map(({ product, reason, comparisonSlug }) => {
            const brief = gearBriefs[product.slug];
            const trialHref = `/report/new?product=${encodeURIComponent(product.slug)}&from=${encodeURIComponent(current.slug)}`;
            return (
              <article key={product.slug} className="card">
                <ProductImage product={product} ratio="1 / 1">
                  <h3>
                    <Link href={`/gear/${product.slug}?from=${current.slug}`}>
                      {productLabel(product)}
                    </Link>
                  </h3>
                  <PriceSticker product={product} short />
                </ProductImage>
                <p>
                  <strong>Why investigate it:</strong> {reason}
                </p>
                {brief && (
                  <p className="small">
                    <strong>Watch for:</strong> {brief.cautions.join(". ")}.
                  </p>
                )}
                <p className="small muted">
                  {isRacquet
                    ? "Retail frame specifications can differ from a pro's custom setup. Demo with matched strings and tension."
                    : product.surface === "hard"
                      ? "Recorded here as a hard-court version. For clay, confirm the exact outsole separately."
                      : product.surface === "clay"
                        ? "Recorded here as a clay version. Manufacturer-only evidence does not establish traction on your court."
                        : "Surface suitability is not recorded for this listing. Check the exact outsole."}{" "}
                  Prices and stock can change.
                </p>
                <div className="cta-row">
                  <Link
                    href={`/gear/${product.slug}?from=${current.slug}`}
                    className="btn btn-primary"
                  >
                    Evidence &amp; save to locker
                  </Link>
                  {comparisonSlug && (
                    <Link href={`/compare/${comparisonSlug}`} className="btn">
                      Compare with mine
                    </Link>
                  )}
                  <Link href={trialHref} className="btn">
                    Tried it? Log the switch
                  </Link>
                </div>
              </article>
            );
          })}
          {comparisonsFor(current.slug).length > 0 && (
            <Link
              href={`/gear/${current.slug}#related-comparisons`}
              className="tap-link"
            >
              All comparisons involving your current gear
            </Link>
          )}
        </section>
      )}
      <aside className={`stack ${s.quiet}`}>
        <h2>Make the trial useful</h2>
        <p>
          Use the same socks or string setup, note the court and hours, and keep
          your old gear as the baseline. Save candidates as “Want to try” in
          your locker, then record what changed and whether you kept them.
        </p>
        <div className={s.tools}>
          <Link href="/community" className="tap-link">
            Read player reports
          </Link>
          <Link href="/play/cost" className="tap-link">
            Compare cost per hour
          </Link>
        </div>
      </aside>
    </div>
  );
}
