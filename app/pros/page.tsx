import type { Metadata } from "next";
import Link from "next/link";
import { GapNote, SourceLink, formatDate } from "@/components/ui";
import { getProduct, productLabel, pros } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Pros",
  description: "Pro tennis gear with the date it was identified, the evidence and the source.",
};

export default function ProsPage() {
  return (
    <div className="wrap page">
      <div className="stack">
        <h1>Pros</h1>
        <p className="lede">
          Pros change gear, so every entry shows when it was identified and who identified it.
        </p>
      </div>

      <div className="grid">
        {pros.map((pro) => {
          const dated = pro.bag.filter((item) => item.productSlug !== null && item.identifiedOn !== null);
          return (
            <article key={pro.slug} className="card">
              <h2>
                <Link href={`/pros/${pro.slug}`}>{pro.name}</Link>
              </h2>
              {dated.length === 0 && <GapNote>No dated gear identification is recorded yet.</GapNote>}
              {dated.map((item) => {
                const product = getProduct(item.productSlug as string);
                if (!product) return null;
                return (
                  <div key={item.slot} className="stack">
                    <p>
                      <span className="eyebrow">{item.slot}</span>
                      <br />
                      {productLabel(product)}
                    </p>
                    <p className="small">Identified {formatDate(item.identifiedOn as string)}</p>
                    <SourceLink source={item.source} standalone />
                  </div>
                );
              })}
              <p className="small muted">{pro.caveat}</p>
              <Link href={`/pros/${pro.slug}`} className="btn">
                See the full bag
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
