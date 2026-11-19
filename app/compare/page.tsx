import type { Metadata } from "next";
import Link from "next/link";
import { comparisons, getProduct, productLabel } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Compare",
  description: "Side-by-side tennis gear comparisons that show what is known and what is still missing.",
};

export default function ComparePage() {
  return (
    <div className="wrap page">
      <div className="stack">
        <h1>Compare</h1>
        <p className="lede">The questions players ask before they buy, with what is known and what is still missing.</p>
      </div>

      <div className="grid">
        {comparisons.map((comparison) => (
          <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="card card-link">
            <span className="eyebrow">{comparison.title}</span>
            <h2>{comparison.question}</h2>
            <p className="small muted">
              {comparison.productSlugs
                .map((slug) => getProduct(slug))
                .flatMap((product) => (product ? [productLabel(product)] : []))
                .join(" · ")}
            </p>
            <div className="row">
              <span className="tag">{comparison.takeaway ? "Has a takeaway" : "No takeaway yet"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
