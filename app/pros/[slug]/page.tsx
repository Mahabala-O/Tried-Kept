import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GapNote, OfferButtons, SourceLink, formatDate } from "@/components/ui";
import {
  comparisonsFor,
  datedPrice,
  getPro,
  getProduct,
  productLabel,
  type BagItem,
  type Product,
} from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) return { title: "Pro not found" };
  return {
    title: `${pro.name} gear`,
    description: `${pro.name}'s gear, with the date and source of each identification.`,
  };
}

/** Finds a comparison that pairs this model with a cheaper one in the catalog. */
function lowerPricedChoice(product: Product) {
  const price = product.priceUsd;
  if (price === null) return null;
  for (const comparison of comparisonsFor(product.slug)) {
    for (const slug of comparison.productSlugs) {
      const other = getProduct(slug);
      if (other && other.priceUsd !== null && other.priceUsd < price) {
        return { comparison, other, saving: price - other.priceUsd };
      }
    }
  }
  return null;
}

function BagEntry({ item }: { item: BagItem }) {
  const product = item.productSlug ? getProduct(item.productSlug) : undefined;

  if (!product || !item.identifiedOn) {
    return (
      <article className="card">
        <span className="eyebrow">{item.slot}</span>
        <GapNote>{item.evidence}</GapNote>
        <p className="small muted">
          Reference: <SourceLink source={item.source} />
        </p>
      </article>
    );
  }

  const cheaper = lowerPricedChoice(product);

  return (
    <article className="card">
      <span className="eyebrow">{item.slot}</span>
      <h3>
        <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>
      </h3>
      <p className="small">
        <strong>Identified {formatDate(item.identifiedOn)}.</strong> {item.evidence}
      </p>
      <SourceLink source={item.source} standalone />
      <OfferButtons product={product} from="pro" />
      {cheaper && (
        <div className="stack">
          <p className="small muted">
            The {cheaper.other.name} was ${cheaper.saving} less at {datedPrice(cheaper.other)}.
          </p>
          <div className="row">
            <Link href={`/compare/${cheaper.comparison.slug}`} className="btn">
              Compare with the {cheaper.other.name}
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

export default async function ProPage({ params }: Props) {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) notFound();

  return (
    <div className="wrap page">
      <div className="stack">
        <Link href="/pros" className="small tap-link">
          All pros
        </Link>
        <h1>{pro.name}</h1>
        <p className="lede">
          What was identified, when, and who says so. This may not be what {pro.name} is using today.
        </p>
      </div>

      <div className="callout">
        <span className="eyebrow">Before you copy a pro</span>
        <p>{pro.caveat}</p>
      </div>

      <section className="stack" aria-labelledby="bag">
        <h2 id="bag">Dated bag</h2>
        <div className="grid">
          {pro.bag.map((item) => (
            <BagEntry key={item.slot} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
