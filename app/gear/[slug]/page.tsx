import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import CompareCard from "@/app/compare/_components/CompareCard";
import AddToLocker from "@/components/AddToLocker";
import { ProImage, ProductImage } from "@/components/MediaFrame";
import ProductReports from "@/components/ProductReports";
import { GapNote, OfferButtons, PriceSticker, SourceLink, SourceList, formatDate } from "@/components/ui";
import { comparisonsFor, getProduct, missingFacts, productLabel, prosUsing, type Product } from "@/lib/catalog";
import s from "../gear.module.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reported?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Gear not found" };
  return { title: productLabel(product), description: product.summary };
}

function KeyFacts({ product }: { product: Product }) {
  const missing = missingFacts(product);
  return (
    <section className="stack-lg" aria-labelledby="specs">
      <div className={s.sectionHead}>
        <span className="eyebrow">By the numbers</span>
        <h2 id="specs">Key facts</h2>
      </div>

      {product.specs.length === 0 && product.sources.length > 0 && (
        <div className={s.known}>
          <p className={s.knownHead}>
            <span className="sticker sticker-kept sticker-sm sticker-plain tilt-left">What we have</span>
            <span>
              {product.sources.length} {product.sources.length === 1 ? "source" : "sources"} on this model so far
            </span>
          </p>
          <ul className={s.knownList}>
            {product.sources.map((source) => (
              <li key={source.url}>
                <SourceLink source={source} standalone />
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.specs.length > 0 && (
        <>
          <dl className={s.facts}>
            {product.specs.map((spec) => (
              <div key={spec.label} className={s.fact}>
                <dt className={s.factLabel}>{spec.label}</dt>
                <dd className={s.factValue}>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <details className={s.factSources}>
            <summary>Where these facts come from</summary>
            <ul>
              {product.specs.map((spec) => (
                <li key={spec.label}>
                  <span className={s.factSourceLabel}>{spec.label}</span>
                  <SourceLink source={spec.source} standalone />
                </li>
              ))}
            </ul>
          </details>
        </>
      )}

      {missing.length > 0 && (
        <div className={s.missing}>
          <p className={s.missingHead}>
            <span className="sticker sticker-paper sticker-sm sticker-plain tilt-left">Not recorded yet</span>
            <span className={s.missingNote}>We leave these blank instead of guessing.</span>
          </p>
          <ul className={s.missingList}>
            {missing.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { reported } = await searchParams;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = comparisonsFor(product.slug);
  const proSightings = prosUsing(product.slug).flatMap((pro) =>
    pro.bag
      .filter((item) => item.productSlug === product.slug && item.identifiedOn !== null)
      .map((item) => ({ pro, item, date: item.identifiedOn as string })),
  );
  const kind = product.category === "shoe" ? "Shoe" : "Racquet";

  return (
    <>
      <section className={s.top} aria-labelledby="product-title">
        <div className={`wrap ${s.topWrap}`}>
          <Link href="/gear" className="small tap-link">
            All gear
          </Link>
          <div className={s.topGrid}>
            <div className={s.visual}>
              <ProductImage product={product} ratio="4 / 3" eager />
              <span className={`sticker sticker-ink ${s.visualSticker}`} style={{ "--tilt": "6deg" } as CSSProperties}>
                {kind}
              </span>
            </div>

            <div className={s.buy}>
              <span className="eyebrow">{product.brand}</span>
              <h1 id="product-title" className={s.name}>
                {product.name}
                {product.line && <span className={s.line}>{product.line}</span>}
              </h1>
              <div className={s.priceRow}>
                <PriceSticker product={product} />
              </div>
              <div className={s.tagRow}>
                {product.surface === "hard" && <span className="sticker sticker-sm sticker-blue sticker-plain tilt-left">Hard court</span>}
                {product.wideVariant && <span className="sticker sticker-sm sticker-paper sticker-plain tilt-right">Wide</span>}
                {product.sku && <span className="sticker sticker-sm sticker-cream sticker-plain tilt-none">Style {product.sku}</span>}
              </div>
              <div className={s.shop} id="where-to-check">
                <h2 className={s.shopTitle}>Where to check</h2>
                <OfferButtons product={product} from="product" />
              </div>
              <p className={s.summary}>{product.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap page">
        <div className="split">
          <div className="stack-lg">
            <KeyFacts product={product} />

            <section className="stack" aria-labelledby="pros-using">
              <h2 id="pros-using">Pros seen using it</h2>
              {proSightings.length === 0 && <GapNote>No dated pro identification is recorded for this model.</GapNote>}
              {proSightings.map(({ pro, item, date }) => (
                <article key={pro.slug} className={`card ${s.sighting}`}>
                  {/* Art, not a photo: a photo of the player would sit beside a shoe claim it does not show. */}
                  <ProImage slug={pro.slug} prefer="art" ratio="16 / 9" artBg="#E6FF3D" />
                  <div className={s.sightingBody}>
                    <span className="sticker sticker-blue sticker-sm sticker-plain sticker-wrap tilt-left">Identified {formatDate(date)}</span>
                    <h3>
                      <Link href={`/pros/${pro.slug}`}>{pro.name}</Link>
                    </h3>
                    <p className="small">{item.evidence}</p>
                    <SourceLink source={item.source} standalone />
                    <GapNote>{pro.caveat}</GapNote>
                  </div>
                </article>
              ))}
            </section>
          </div>

          <aside className="stack-lg" aria-label="Save to your locker">
            <AddToLocker productSlug={product.slug} />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="stack-lg" aria-labelledby="related-comparisons">
            <h2 id="related-comparisons">Compare it</h2>
            <div className="grid">
              {related.map((comparison) => (
                <CompareCard key={comparison.slug} comparison={comparison} />
              ))}
            </div>
          </section>
        )}

        <ProductReports productSlug={product.slug} justPublished={reported === "1"} />

        {product.sources.length === 0 ? (
          <GapNote>No outside source is recorded for this model yet.</GapNote>
        ) : (
          // A model with no spec tiles already lists its sources up top, under What we have.
          product.specs.length > 0 && <SourceList sources={product.sources} />
        )}
      </div>
    </>
  );
}
