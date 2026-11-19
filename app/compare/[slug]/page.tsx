import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductReports from "@/components/ProductReports";
import ScoutMark from "@/components/ScoutMark";
import { GapNote, OfferButtons, ProductCard, SourceLink, SourceList } from "@/components/ui";
import { demoProgram, getComparison, getProduct, productLabel, type Product } from "@/lib/catalog";
import { breakEvenHours, costPerHour } from "@/lib/finder";

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

function WorkedExample({ pricier, cheaper }: { pricier: Product; cheaper: Product }) {
  if (pricier.priceUsd === null || cheaper.priceUsd === null) return null;
  const perHour = costPerHour(cheaper.priceUsd, EXAMPLE_HOURS);
  const hoursNeeded = breakEvenHours(cheaper.priceUsd, EXAMPLE_HOURS, pricier.priceUsd);
  if (perHour === null) return null;

  return (
    <section className="stack" aria-labelledby="worked-example">
      <h2 id="worked-example">What the extra ${pricier.priceUsd - cheaper.priceUsd} has to buy</h2>
      <div className="callout">
        <span className="eyebrow">Worked example</span>
        <p>
          ${cheaper.priceUsd} over {EXAMPLE_HOURS} hours is ${perHour.toFixed(2)} per hour, so the ${pricier.priceUsd} pair
          needs {Math.round(hoursNeeded)} hours to match it.
        </p>
      </div>
      <GapNote>{EXAMPLE_HOURS} hours is an example, not a measured lifespan. Durability for these shoes is not recorded.</GapNote>
      <div className="row">
        <Link href="/play/cost" className="btn">
          Try your own numbers
        </Link>
      </div>
    </section>
  );
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();

  const models = comparison.productSlugs.flatMap((productSlug) => {
    const product = getProduct(productSlug);
    return product ? [product] : [];
  });
  const vapor12 = getProduct("nike-vapor-12");
  const vaporPro3 = getProduct("nike-vapor-pro-3");

  return (
    <div className="wrap page">
      <div className="stack">
        <Link href="/compare" className="small tap-link">
          All comparisons
        </Link>
        <span className="eyebrow">{comparison.title}</span>
        <h1>{comparison.question}</h1>
      </div>

      <section className="stack" aria-labelledby="models">
        <h2 id="models">The models</h2>
        <div className="grid">
          {models.map((product) => (
            <div key={product.slug} className="stack">
              <ProductCard product={product} />
              <OfferButtons product={product} from="compare" />
            </div>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="side-by-side">
        <h2 id="side-by-side">Side by side</h2>
        {comparison.rows.length > 0 ? (
          <div className="table-scroll" role="region" aria-labelledby="side-by-side" tabIndex={0} style={{ contain: "inline-size" }}>
            <table>
              <thead>
                <tr>
                  <th scope="col">What we compared</th>
                  {models.map((product) => (
                    <th scope="col" key={product.slug}>
                      {product.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">
                      {row.label}
                      {row.source && (
                        <>
                          <br />
                          <SourceLink source={row.source} />
                        </>
                      )}
                    </th>
                    {row.values.map((value, i) => (
                      <td key={models[i]?.slug ?? i}>
                        {value}
                        {row.valueSources?.[i] && (
                          <>
                            <br />
                            <SourceLink source={row.valueSources[i]} standalone />
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <GapNote>No side-by-side measurements are recorded for this comparison yet.</GapNote>
        )}
        {comparison.gap && <GapNote>{comparison.gap}</GapNote>}
      </section>

      {comparison.takeaway ? (
        <div className="callout">
          <span className="eyebrow">Takeaway</span>
          <p>{comparison.takeaway}</p>
        </div>
      ) : (
        <GapNote>No takeaway yet. The evidence recorded so far is too thin to call this one.</GapNote>
      )}

      {comparison.slug === "vapor-12-vs-vapor-pro-3" && vapor12 && vaporPro3 && (
        <WorkedExample pricier={vapor12} cheaper={vaporPro3} />
      )}

      {comparison.slug === "ezone-98-2022-vs-2025" && (
        <section className="card" aria-labelledby="demo-first">
          <h2 id="demo-first">Demo before you buy</h2>
          <p>{demoProgram.summary}</p>
          <SourceLink source={demoProgram.source} standalone />
        </section>
      )}

      <section className="stack" aria-labelledby="firsthand">
        <h2 id="firsthand">Firsthand replies</h2>
        {comparison.firsthand.length > 0 ? (
          <div className="table-scroll" role="region" aria-labelledby="firsthand" tabIndex={0} style={{ contain: "inline-size" }}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">What the reply said</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                {comparison.firsthand.map((reply) => {
                  const product = getProduct(reply.productSlug);
                  return (
                    <tr key={reply.productSlug}>
                      <th scope="row">
                        {product ? <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link> : reply.productSlug}
                      </th>
                      <td>{reply.learned}</td>
                      <td>
                        <SourceLink source={reply.source} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <GapNote>No firsthand replies are recorded for this comparison yet.</GapNote>
        )}
      </section>

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
