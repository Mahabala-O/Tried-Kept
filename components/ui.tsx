import Link from "next/link";
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

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <p className="small muted">
      Sources:{" "}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && " · "}
          <SourceLink source={s} />
        </span>
      ))}
    </p>
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
      <div className="row">
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

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/gear/${product.slug}`} className="card card-link">
      <span className="eyebrow">{product.brand}</span>
      <h3>
        {product.name}
        {product.line ? ` (${product.line})` : ""}
      </h3>
      <p className="small muted">{product.summary}</p>
      <div className="row">
        <span className="tag">{datedPrice(product)}</span>
        {product.wideVariant && <span className="tag">Wide</span>}
        {product.surface === "hard" && <span className="tag">Hard court</span>}
      </div>
    </Link>
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
