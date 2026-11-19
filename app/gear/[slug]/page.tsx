import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToLocker from "@/components/AddToLocker";
import ProductReports from "@/components/ProductReports";
import { GapNote, OfferButtons, SourceLink, SourceList, formatDate } from "@/components/ui";
import { comparisonsFor, getProduct, missingFacts, productLabel, prosUsing } from "@/lib/catalog";

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

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { reported } = await searchParams;
  const product = getProduct(slug);
  if (!product) notFound();

  const missing = missingFacts(product);
  const related = comparisonsFor(product.slug);
  const proSightings = prosUsing(product.slug).flatMap((pro) =>
    pro.bag
      .filter((item) => item.productSlug === product.slug && item.identifiedOn !== null)
      .map((item) => ({ pro, item, date: item.identifiedOn as string })),
  );

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">{product.brand}</span>
        <h1>
          {product.name}
          {product.line ? ` (${product.line})` : ""}
        </h1>
        <p className="lede">{product.summary}</p>
        <div className="row">
          <span className="tag">{product.category === "shoe" ? "Shoe" : "Racquet"}</span>
          {product.surface === "hard" && <span className="tag">Hard court</span>}
          {product.wideVariant && <span className="tag">Wide</span>}
          {product.sku && <span className="tag">Style {product.sku}</span>}
        </div>
      </div>

      <div className="split">
        <div className="stack-lg">
          <section className="stack" aria-labelledby="specs">
            <h2 id="specs">Specs</h2>
            {product.specs.length > 0 && (
              <div className="table-scroll" role="region" aria-labelledby="specs" tabIndex={0} style={{ contain: "inline-size" }}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Fact</th>
                      <th scope="col">Value</th>
                      <th scope="col">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.label}>
                        <th scope="row">{spec.label}</th>
                        <td>{spec.value}</td>
                        <td>
                          <SourceLink source={spec.source} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {missing.length > 0 && (
              <GapNote>
                Not recorded yet: {missing.join(", ")}. We leave these blank instead of guessing.
              </GapNote>
            )}
          </section>

          <section className="stack" aria-labelledby="pros-using">
            <h2 id="pros-using">Pros seen using it</h2>
            {proSightings.length === 0 && <GapNote>No dated pro identification is recorded for this model.</GapNote>}
            {proSightings.map(({ pro, item, date }) => (
              <article key={pro.slug} className="card">
                <h3>
                  <Link href={`/pros/${pro.slug}`}>{pro.name}</Link>
                </h3>
                <p className="small">
                  <strong>Identified {formatDate(date)}.</strong> {item.evidence}
                </p>
                <SourceLink source={item.source} standalone />
                <p className="small muted">{pro.caveat}</p>
              </article>
            ))}
          </section>
        </div>

        <aside className="stack-lg" aria-label="Shop and save">
          <section className="stack" aria-labelledby="where-to-check">
            <h2 id="where-to-check">Where to check</h2>
            <OfferButtons product={product} from="product" />
          </section>
          <AddToLocker productSlug={product.slug} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="stack" aria-labelledby="related-comparisons">
          <h2 id="related-comparisons">Compare it</h2>
          <div className="grid">
            {related.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="card card-link">
                <span className="eyebrow">{comparison.title}</span>
                <h3>{comparison.question}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductReports productSlug={product.slug} justPublished={reported === "1"} />

      {product.sources.length > 0 ? (
        <SourceList sources={product.sources} />
      ) : (
        <GapNote>No outside source is recorded for this model yet.</GapNote>
      )}
    </div>
  );
}
