import Link from "next/link";
import type { CSSProperties } from "react";
import { ProductImage } from "@/components/MediaFrame";
import { getProduct, productLabel, type Comparison, type Product } from "@/lib/catalog";
import s from "../compare.module.css";

export function comparisonModels(comparison: Comparison): Product[] {
  return comparison.productSlugs.flatMap((slug) => {
    const product = getProduct(slug);
    return product ? [product] : [];
  });
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** A whole-card link to a comparison. The title carries the link, so photo credits stay clickable. */
export default function CompareCard({ comparison, headingLevel = 3 }: { comparison: Comparison; headingLevel?: 2 | 3 }) {
  const models = comparisonModels(comparison);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const detail =
    comparison.rows.length > 0
      ? plural(comparison.rows.length, "fact side by side", "facts side by side")
      : comparison.firsthand.length > 0
        ? plural(comparison.firsthand.length, "forum reply", "forum replies")
        : null;

  return (
    <article className={`card card-link ${s.cmpCard}`}>
      <div
        className={`${s.cmpThumbs} ${models.length > 2 ? s.cmpThumbs3 : ""}`}
        style={{ "--n": Math.max(models.length, 1) } as CSSProperties}
      >
        {models.map((product) => (
          <ProductImage key={product.slug} product={product} ratio="1 / 1" />
        ))}
        {models.length === 2 && (
          <span className={s.cmpVs} aria-hidden="true">
            VS
          </span>
        )}
      </div>
      <span className="eyebrow">{comparison.title}</span>
      <Heading className={s.cmpQuestion}>
        <Link href={`/compare/${comparison.slug}`} className="stretched-link">
          {comparison.question}
        </Link>
      </Heading>
      <p className="small muted">{models.map((product) => productLabel(product)).join(" · ")}</p>
      <div className={s.cmpMeta}>
        {comparison.takeaway ? (
          <span className="sticker sticker-kept sticker-sm sticker-plain tilt-left">Has a takeaway</span>
        ) : (
          <span className="sticker sticker-paper sticker-sm sticker-plain tilt-left">No takeaway yet</span>
        )}
        {detail && <span className="sticker sticker-cream sticker-sm sticker-plain tilt-right">{detail}</span>}
      </div>
    </article>
  );
}
