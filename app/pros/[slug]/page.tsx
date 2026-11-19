import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import ShoeArt from "@/components/art/ShoeArt";
import RacquetArt from "@/components/art/RacquetArt";
import MediaFrame, { ProImage, ProductImage } from "@/components/MediaFrame";
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
import { proMedia } from "@/lib/media";
import s from "../pros.module.css";

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
      <article className={`card ${s.unknownCard}`}>
        <div className={s.unknownTop}>
          <div className={s.unknownArt} role="img" aria-label={`Generic ${item.slot.toLowerCase()} illustration; model not identified`}>
            {item.slot === "Shoes" ? <ShoeArt /> : <RacquetArt />}
          </div>
          <div className={s.gearStickers}>
            <span className="sticker sticker-ink sticker-sm tilt-left">{item.slot}</span>
            <span className="sticker sticker-paper sticker-sm sticker-plain tilt-right">Not identified yet</span>
          </div>
        </div>
        <GapNote>{item.evidence}</GapNote>
        <p className="small muted">
          Reference: <SourceLink source={item.source} />
        </p>
      </article>
    );
  }

  const cheaper = lowerPricedChoice(product);

  return (
    <article className={`card ${s.gearCard}`}>
      <ProductImage product={product} ratio="4 / 3" />
      <div className={s.gearStickers}>
        <span className="sticker sticker-ink sticker-sm tilt-left">{item.slot}</span>
        <span className="sticker sticker-blue sticker-sm sticker-plain sticker-wrap tilt-right">Identified {formatDate(item.identifiedOn)}</span>
      </div>
      <h3 className={s.gearName}>
        <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>
      </h3>
      <p className="small">{item.evidence}</p>
      <SourceLink source={item.source} standalone />
      <OfferButtons product={product} from="pro" />
      {cheaper && (
        <div className={s.cheaper}>
          <p className="small">
            <strong>
              The {cheaper.other.name} was ${cheaper.saving} less
            </strong>{" "}
            at {datedPrice(cheaper.other)}.
          </p>
          <div className="cta-row">
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

  const media = proMedia[pro.slug];
  const heroGif = media?.gifs[0] ?? null;
  // The hero shows the first clip (or the portrait when there is no clip). The gallery shows the rest.
  const galleryGifs = heroGif ? (media?.gifs.slice(1) ?? []) : [];
  const galleryPhoto = heroGif ? (media?.portrait ?? null) : null;
  const hasGallery = galleryGifs.length > 0 || galleryPhoto !== null;

  const dates = pro.bag.flatMap((item) => (item.productSlug && item.identifiedOn ? [item.identifiedOn] : []));
  const latest = dates.length > 0 ? dates.reduce((a, b) => (a > b ? a : b)) : null;

  return (
    <>
      <section className={`band band-hardcourt court-lines ${s.hero}`} aria-labelledby="pro-title">
        <div className={`wrap ${s.heroGrid} ${s.heroGridMediaFirst}`}>
          <div className={s.heroCopy}>
            <Link href="/pros" className={`small tap-link ${s.back}`}>
              All pros
            </Link>
            <span className="eyebrow">Pro bag</span>
            <h1 id="pro-title" className={s.heroTitle}>
              {pro.name}
            </h1>
            <p className="lede">
              What was identified, when, and who says so. This may not be what {pro.name} is using today.
            </p>
            <div className={s.heroStats}>
              <span className="sticker sticker-xp sticker-plain tilt-left">
                {dates.length} dated {dates.length === 1 ? "item" : "items"}
              </span>
              {latest && (
                <span className="sticker sticker-paper sticker-plain sticker-wrap tilt-right">Latest: {formatDate(latest)}</span>
              )}
            </div>
          </div>
          <div className={s.heroMedia}>
            <ProImage slug={pro.slug} prefer="gif" ratio="1 / 1" eager artBg="#E6FF3D" note="Shows the player, not the gear in the bag below." />
            <span className={`sticker sticker-ink ${s.heroSticker}`} style={{ "--tilt": "-6deg" } as CSSProperties}>
              Dated bag
            </span>
          </div>
        </div>
      </section>

      <div className="wrap page">
        <div className="callout">
          <span className="eyebrow">Before you copy a pro</span>
          <p>{pro.caveat}</p>
        </div>

        <section className="stack-lg" aria-labelledby="bag">
          <h2 id="bag">Dated bag</h2>
          <div className={s.bag}>
            {pro.bag.map((item) => (
              <BagEntry key={item.slot} item={item} />
            ))}
          </div>
        </section>

        {hasGallery && (
          <section className="stack-lg" aria-labelledby="on-court">
            <div className="stack">
              <h2 id="on-court">On court</h2>
              <p className="muted">
                Clips and photos of {pro.name}. They show the player, not the gear in the bag above.
              </p>
            </div>
            <ul className={s.gallery} aria-label={`Clips and photos of ${pro.name}`} tabIndex={0}>
              {galleryGifs.map((gif) => (
                <li key={gif.id}>
                  <MediaFrame gif={gif} fallback={null} ratio="4 / 3" />
                </li>
              ))}
              {galleryPhoto && (
                <li>
                  <MediaFrame photo={galleryPhoto} fallback={null} ratio="4 / 3" />
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
