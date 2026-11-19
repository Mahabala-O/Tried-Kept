import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import BallArt from "@/components/art/BallArt";
import ProductArt from "@/components/art/ProductArt";
import { ProductImage } from "@/components/MediaFrame";
import ProductReports from "@/components/ProductReports";
import ScoutMark from "@/components/ScoutMark";
import { GapNote, OfferButtons, PriceSticker, SourceLink, SourceList, formatDate } from "@/components/ui";
import { demoProgram, getComparison, getProduct, productLabel, type Comparison, type Product } from "@/lib/catalog";
import { breakEvenHours, costPerHour } from "@/lib/finder";
import { productPhotos } from "@/lib/media";
import { comparisonModels } from "../_components/CompareCard";
import s from "../compare.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** An illustration only. The catalog holds no measured lifespan for either shoe. */
const EXAMPLE_HOURS = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) return { title: "Comparison not found" };
  return { title: comparison.title, description: comparison.question };
}

/** "a", "a and b", "a, b and c". */
function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

/** Every model side by side with its picture and dated price. */
function VsHero({ models }: { models: Product[] }) {
  const priced = models.filter((p) => p.priceUsd !== null);
  const [a, b] = models;
  const gap =
    models.length === 2 && priced.length === 2 && a.priceCheckedOn && a.priceCheckedOn === b.priceCheckedOn
      ? { amount: Math.abs(a.priceUsd! - b.priceUsd!), pricier: a.priceUsd! > b.priceUsd! ? a : b, checkedOn: a.priceCheckedOn }
      : null;

  return (
    <div className="stack-lg">
      <div className={`${s.vsHero} ${models.length > 2 ? s.vsHero3 : ""}`} style={{ "--n": models.length } as CSSProperties}>
        {models.map((product, i) => (
          <div key={product.slug} className={s.vsSide}>
            <ProductImage product={product} ratio="1 / 1" eager />
            <p className={s.vsName}>
              <Link href={`/gear/${product.slug}`}>
                <span className={s.vsBrand}>{product.brand}</span> {product.name}
                {product.line ? ` (${product.line})` : ""}
              </Link>
            </p>
            <div className={s.vsPrice}>
              <PriceSticker product={product} tilt={i % 2 === 0 ? "tilt-left" : "tilt-right"} short={models.length > 2} />
            </div>
          </div>
        ))}
        {models.length === 2 && (
          <span className={s.vsBadge} aria-hidden="true">
            VS
          </span>
        )}
      </div>
      {gap && gap.amount > 0 && (
        <p className={s.gapLine}>
          <span className={`sticker sticker-returned ${s.gapSticker}`}>${gap.amount}</span>
          <span>
            more for the {gap.pricier.name}, at the prices checked {formatDate(gap.checkedOn)}.
          </span>
        </p>
      )}
    </div>
  );
}

/** A small picture for the sticky header. Art only: a photo would need its credit right beside it. */
function MiniThumb({ product }: { product: Product }) {
  if (productPhotos[product.slug]) return null;
  return (
    <span className={s.miniThumb} aria-hidden="true">
      <ProductArt product={product} hideLabel />
    </span>
  );
}

function SideBySide({ comparison, models }: { comparison: Comparison; models: Product[] }) {
  const sourced = comparison.rows.filter((row) => row.source || row.valueSources?.length);
  return (
    <section className="stack" aria-labelledby="side-by-side">
      <h2 id="side-by-side">Side by side</h2>
      {comparison.rows.length > 0 ? (
        <>
          <dl
            className={`vs-grid ${s.vsGrid} ${models.length > 2 ? "vs-grid-3" : ""}`}
            style={{ "--vs-cols": models.length } as CSSProperties}
            aria-label={`${comparison.title}, side by side`}
          >
            <div className={`vs-row vs-head ${s.stickyHead}`}>
              <dt className="vs-label">Model</dt>
              {models.map((product) => (
                <dd key={product.slug} className="vs-value">
                  <span className={s.mini}>
                    <MiniThumb product={product} />
                    <span className={s.miniName}>{product.name}</span>
                  </span>
                </dd>
              ))}
            </div>
            {comparison.rows.map((row) => (
              <div key={row.label} className="vs-row">
                <dt className="vs-label">{row.label}</dt>
                {row.values.map((value, i) => {
                  const [main, ...rest] = value.split(" · ");
                  return (
                    <dd key={models[i]?.slug ?? i} className="vs-value">
                      <span className="sr-only">{models[i]?.name}: </span>
                      {main}
                      {rest.length > 0 && <span className={`small ${s.valueSub}`}>{rest.join(" · ")}</span>}
                    </dd>
                  );
                })}
              </div>
            ))}
          </dl>
          {sourced.length > 0 && (
            <details className={s.details}>
              <summary>Where these numbers come from</summary>
              <ul>
                {sourced.map((row) => (
                  <li key={row.label}>
                    <span className={s.detailLabel}>{row.label}</span>
                    {row.valueSources?.map((source) => (
                      <SourceLink key={source.url} source={source} standalone />
                    ))}
                    {row.source && <SourceLink source={row.source} standalone />}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      ) : (
        <GapNote>No side-by-side measurements are recorded for this comparison yet.</GapNote>
      )}
      {comparison.gap && <GapNote>{comparison.gap}</GapNote>}
    </section>
  );
}

function Takeaway({ takeaway }: { takeaway: string | null }) {
  if (!takeaway) {
    return (
      <section className={`card ${s.open}`} aria-labelledby="takeaway">
        <h2 id="takeaway" className="sticker sticker-paper sticker-plain tilt-left">
          Still open
        </h2>
        <p>No takeaway yet. The evidence recorded so far is too thin to call this one.</p>
      </section>
    );
  }
  return (
    <section className={`callout ${s.takeaway}`} aria-labelledby="takeaway">
      <h2 id="takeaway" className="sticker sticker-ink tilt-left">
        Takeaway
      </h2>
      <p className={s.takeawayText}>{takeaway}</p>
    </section>
  );
}

function WorkedExample({ pricier, cheaper }: { pricier: Product; cheaper: Product }) {
  if (pricier.priceUsd === null || cheaper.priceUsd === null) return null;
  const perHour = costPerHour(cheaper.priceUsd, EXAMPLE_HOURS);
  const hoursNeeded = breakEvenHours(cheaper.priceUsd, EXAMPLE_HOURS, pricier.priceUsd);
  if (perHour === null || hoursNeeded <= 0) return null;
  const needed = Math.round(hoursNeeded);
  const scale = Math.max(needed, EXAMPLE_HOURS);
  const width = (hours: number) => `${Math.round((hours / scale) * 100)}%`;

  return (
    <section className="stack" aria-labelledby="worked-example">
      <h2 id="worked-example">What the extra ${pricier.priceUsd - cheaper.priceUsd} has to buy</h2>
      <div className={`card ${s.example}`}>
        <div className="row between">
          <span className="sticker sticker-xp sticker-plain tilt-left">Worked example</span>
          <BallArt bounce className={s.exampleBall} />
        </div>
        <p className={s.equation} aria-hidden="true">
          <span className={s.eqTile}>
            {money(cheaper.priceUsd)}
            <span className={s.eqUnit}>{cheaper.name}</span>
          </span>
          <span className={s.eqOp}>÷</span>
          <span className={s.eqTile}>
            {EXAMPLE_HOURS} h<span className={s.eqUnit}>example hours</span>
          </span>
          <span className={s.eqOp}>=</span>
          <span className={`${s.eqTile} ${s.eqAnswer}`}>
            {money(perHour)}
            <span className={s.eqUnit}>per hour</span>
          </span>
        </p>
        <ul className={s.bars} aria-hidden="true">
          <li className={s.bar}>
            <span className={s.barHead}>
              <span>
                {cheaper.name}, {money(cheaper.priceUsd)}
              </span>
              <span className={s.barHours}>{EXAMPLE_HOURS} h</span>
            </span>
            <span className={s.barTrack}>
              <span className={s.barFill} style={{ "--w": width(EXAMPLE_HOURS), display: "block" } as CSSProperties} />
            </span>
          </li>
          <li className={s.bar}>
            <span className={s.barHead}>
              <span>
                {pricier.name}, {money(pricier.priceUsd)}
              </span>
              <span className={s.barHours}>{needed} h to match</span>
            </span>
            <span className={s.barTrack}>
              <span className={`${s.barFill} ${s.barFillPricier}`} style={{ "--w": width(needed), display: "block" } as CSSProperties} />
            </span>
          </li>
        </ul>
        <p>
          ${cheaper.priceUsd} over {EXAMPLE_HOURS} hours is ${perHour.toFixed(2)} per hour, so the ${pricier.priceUsd} pair needs{" "}
          {needed} hours to match it.
        </p>
      </div>
      <GapNote>{EXAMPLE_HOURS} hours is an example, not a measured lifespan. Durability for these shoes is not recorded.</GapNote>
      <div className="cta-row">
        <Link href="/play/cost" className="btn btn-optic">
          Try your own numbers
        </Link>
      </div>
    </section>
  );
}

function Firsthand({ comparison }: { comparison: Comparison }) {
  return (
    <section className="stack" aria-labelledby="firsthand">
      <h2 id="firsthand">Firsthand replies</h2>
      {comparison.firsthand.length > 0 ? (
        <div className={s.replies}>
          {comparison.firsthand.map((reply) => {
            const product = getProduct(reply.productSlug);
            return (
              <article key={reply.productSlug} className={`card ${s.reply}`}>
                <div className={s.replyHead}>
                  {product && <ProductImage product={product} ratio="1 / 1" />}
                  <div className="stack">
                    <span className="sticker sticker-cream sticker-sm sticker-plain tilt-left">Forum reply</span>
                    <h3 className={s.replyName}>
                      {product ? <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link> : reply.productSlug}
                    </h3>
                  </div>
                </div>
                <p className={s.bubble}>{reply.learned}</p>
                <SourceLink source={reply.source} standalone />
              </article>
            );
          })}
        </div>
      ) : (
        <GapNote>No firsthand replies are recorded for this comparison yet.</GapNote>
      )}
    </section>
  );
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();

  const models = comparisonModels(comparison);
  const unlinked = models.filter((p) => p.offers.length === 0);
  const vapor12 = getProduct("nike-vapor-12");
  const vaporPro3 = getProduct("nike-vapor-pro-3");

  return (
    <div className="wrap page">
      <div className={s.head}>
        <Link href="/compare" className="small tap-link">
          All comparisons
        </Link>
        <span className="eyebrow">{comparison.title}</span>
        <h1 className={s.title}>{comparison.question}</h1>
      </div>

      <VsHero models={models} />

      <SideBySide comparison={comparison} models={models} />

      <Takeaway takeaway={comparison.takeaway} />

      {comparison.slug === "vapor-12-vs-vapor-pro-3" && vapor12 && vaporPro3 && (
        <WorkedExample pricier={vapor12} cheaper={vaporPro3} />
      )}

      {comparison.slug === "ezone-98-2022-vs-2025" && (
        <section className={`card ${s.demo}`} aria-labelledby="demo-first">
          <span className="sticker sticker-blue sticker-sm sticker-plain tilt-left">Tip</span>
          <h2 id="demo-first">Demo before you buy</h2>
          <p>{demoProgram.summary}</p>
          <SourceLink source={demoProgram.source} standalone />
        </section>
      )}

      <section className="stack" aria-labelledby="where-to-check">
        <h2 id="where-to-check">Where to check</h2>
        {models.some((p) => p.offers.length > 0) && (
        <div className={s.shopGrid}>
          {models.filter((p) => p.offers.length > 0).map((product) => (
            <article key={product.slug} className={`card ${s.shopCard}`}>
              <span className="eyebrow">{product.brand}</span>
              <h3>
                <Link href={`/gear/${product.slug}`}>
                  {product.name}
                  {product.line ? ` (${product.line})` : ""}
                </Link>
              </h3>
              <div className={s.shopPrice}>
                <PriceSticker product={product} />
              </div>
              <OfferButtons product={product} from="compare" />
            </article>
          ))}
        </div>
        )}
        {unlinked.length > 0 && (
          <GapNote>
            No checked retailer link yet for {listNames(unlinked.map((p) => `the ${p.name}${p.line ? ` (${p.line})` : ""}`))}.
          </GapNote>
        )}
      </section>

      <Firsthand comparison={comparison} />

      <div className="stack-lg">
        {models.map((product) => (
          <div key={product.slug} className="stack">
            <span className="eyebrow">{productLabel(product)}</span>
            <ProductReports productSlug={product.slug} />
          </div>
        ))}
      </div>

      <ScoutMark comparisonSlug={comparison.slug} />

      <SourceList sources={comparison.sources} />
    </div>
  );
}
