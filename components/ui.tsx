import Link from "next/link";
import { ShoeRatingLine } from "@/components/ShoeRatings";
import { ProductImage } from "@/components/MediaFrame";
import { offerHref, type EntryPoint } from "@/lib/affiliate";
import { datedPrice, formatDate, productLabel, retailers, type Product, type Source } from "@/lib/catalog";

/** Set standalone when the link sits on its own line, so it stays a full-size tap target. */
export function SourceLink({ source, standalone = false }: { source: Source; standalone?: boolean }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={standalone ? "small tap-link" : "small"}
    >
      {source.label}
    </a>
  );
}

/** An inline line of sources on wide screens, a compact "Sources (n)" toggle on phones. */
export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <>
      <p className="small muted sources-inline">
        Sources:{" "}
        {sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <SourceLink source={s} />
          </span>
        ))}
      </p>
      <details className="sources-details small">
        <summary>Sources ({sources.length})</summary>
        <ul>
          {sources.map((s) => (
            <li key={s.url}>
              <SourceLink source={s} standalone />
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}

export function GapNote({ children }: { children: React.ReactNode }) {
  return <p className="gap-note">{children}</p>;
}

/** Retailer buttons always go through /go so clicks are counted and tagged. */
export function OfferButtons({ product, from }: { product: Product; from: EntryPoint }) {
  if (product.offers.length === 0) {
    return <GapNote>No checked retailer link for this model yet.</GapNote>;
  }
  return (
    <div className="stack">
      <div className="cta-row">
        {product.offers.map((offer) => (
          <a
            key={offer.id}
            href={offerHref(offer.id, from)}
            className="btn btn-shop"
            target="_blank"
            rel="sponsored nofollow noopener"
          >
            Check price at {retailers[offer.retailerId].name}
            <span className="sr-only"> for {productLabel(product)}</span>
          </a>
        ))}
      </div>
      <p className="small muted">
        Link checked {formatDate(product.offers[0].checkedOn)}. Size availability is not confirmed.{" "}
        <Link href="/disclosure">We may earn a commission.</Link>
      </p>
    </div>
  );
}

/** The price as a sticker, always with the day it was checked. */
export function PriceSticker({ product, tilt = "tilt-left", short = false }: { product: Product; tilt?: string; short?: boolean }) {
  if (product.priceUsd === null) {
    return <span className="tag">{short ? "No price yet" : "Price not recorded"}</span>;
  }
  if (!product.priceCheckedOn) {
    return <span className={`sticker sticker-paper sticker-sm sticker-plain ${tilt}`}>{datedPrice(product)}</span>;
  }
  return (
    <>
      <span className={`sticker sticker-xp sticker-plain ${tilt}`}>${product.priceUsd}</span>
      <span className="price-date">Checked {formatDate(product.priceCheckedOn)}</span>
    </>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card card-link product-card" data-product-card={product.slug}>
      <ProductImage product={product} ratio={product.category === "clothing" ? "4 / 5" : product.category === "sock" ? "1 / 1" : "4 / 3"} />
      <div className="product-card-body">
        <span className="eyebrow">{product.brand}</span>
        <h3>
          <Link href={`/gear/${product.slug}`} className="stretched-link">
            {product.name}
            {product.line ? ` (${product.line})` : ""}
          </Link>
        </h3>
        <p className="small muted">{product.summary}</p>
        <ShoeRatingLine productSlug={product.slug} />
      </div>
      <div className="price-row">
        <PriceSticker product={product} />
        {product.wideVariant && <span className="sticker sticker-sm sticker-paper tilt-right">Wide</span>}
        {product.surface === "hard" && <span className="sticker sticker-sm sticker-blue tilt-right">Hard court</span>}
        {product.category === "sock" && <span className="tag">Socks</span>}
        {product.category === "clothing" && <span className="tag">Clothing</span>}
        {product.category === "racquet" && <span className="sticker sticker-sm sticker-paper tilt-right">Racquet</span>}
      </div>
    </article>
  );
}

export function XpBar({ progress, label }: { progress: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <div className="xpbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export { formatDate, productLabel };
