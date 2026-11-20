import SponsorshipFacts from "@/components/SponsorshipFacts";
import { sponsorships } from "@/lib/sponsorships";
import { bagDateLabel } from "@/lib/discovery";
import StoryCard from "@/components/StoryCard";
import { storiesForPro, proWardrobe } from "@/lib/editorial";
import type { Metadata } from "next";
import Link from "next/link";
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
    description: `${pro.name}'s reported gear and retail references, with dates and sources.`,
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
          <div
            className={s.unknownArt}
            role="img"
            aria-label={`Generic ${item.slot.toLowerCase()} illustration; model not identified`}
          >
            {item.slot === "Shoes" ? <ShoeArt /> : <RacquetArt />}
          </div>
          <div className={s.gearStickers}>
            <span className="sticker sticker-ink sticker-sm tilt-left">
              {item.slot}
            </span>
            <span className="sticker sticker-paper sticker-sm sticker-plain tilt-right">
              Not identified yet
            </span>
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
      <p className="small muted">
        {item.slot}
        {item.familyAlternative ? " · Retail family alternative" : ""}
      </p>
      <h3 className={s.gearName}>
        <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>
      </h3>
      <p className="small muted">
        {bagDateLabel(item)} {formatDate(item.identifiedOn)}
      </p>
      <details className={s.referenceDetails}>
        <summary>Evidence &amp; source</summary>
        <p>{item.evidence}</p>
        <SourceLink source={item.source} standalone />
      </details>
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
            <Link
              href={`/gear/compare/${cheaper.comparison.slug}`}
              className="btn"
            >
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
  const galleryGifs = media?.gifs ?? [];
  const hasGallery = galleryGifs.length > 0;

  const dates = pro.bag.flatMap((item) =>
    item.productSlug && item.identifiedOn ? [item.identifiedOn] : [],
  );
  const latest =
    dates.length > 0 ? dates.reduce((a, b) => (a > b ? a : b)) : null;

  return (
    <>
      <section
        className={`band band-hardcourt court-lines ${s.hero}`}
        aria-labelledby="pro-title"
      >
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
              Get to know {pro.name.split(" ")[0]}’s setup. Follow the sources
              and explore the retail alternatives.
            </p>
            <p className="small">
              {dates.length} dated references
              {latest ? ` · Latest: ${formatDate(latest)}` : ""}
            </p>
          </div>
          <div className={s.heroMedia}>
            <ProImage
              slug={pro.slug}
              prefer="photo"
              ratio="16 / 10"
              eager
              artBg="#E6FF3D"
              note="Shows the player, not the gear in the bag below."
            />
          </div>
        </div>
      </section>

      <div className="wrap page">
        <nav
          className={`chip-scroll ${s.profileNav}`}
          aria-label="Profile sections"
        >
          <a className="chip" href="#bag">
            Gear
          </a>
          {proWardrobe[pro.slug] && (
            <a className="chip" href="#wardrobe-title">
              Style
            </a>
          )}
          {storiesForPro(pro.slug).length > 0 && (
            <a className="chip" href="#gear-stories">
              Stories
            </a>
          )}
          {(sponsorships[pro.slug]?.length ?? 0) > 0 && (
            <a
              className="chip"
              href="#partnerships"
              aria-label="Sponsorship deals"
            >
              Deals
            </a>
          )}
          {hasGallery && (
            <a className="chip" href="#on-court">
              Clips
            </a>
          )}
        </nav>
        <p className="small muted">{pro.caveat}</p>

        <section className="stack-lg" aria-labelledby="bag">
          <h2 id="bag">Equipment</h2>
          {!pro.bag.some((item) => item.slot === "Shoes") && (
            <p className="small muted">A shoe model is not yet recorded for this player. The racquet reference below does not identify their footwear.</p>
          )}
          <div className={s.bag}>
            {pro.bag.map((item) => (
              <BagEntry key={item.slot} item={item} />
            ))}
          </div>
        </section>

        {proWardrobe[pro.slug] && (
          <section className="stack-lg" aria-labelledby="wardrobe-title">
            <h2 id="wardrobe-title">Clothing &amp; court style</h2>
            {proWardrobe[pro.slug].map((look) => (
              <article className="card" key={look.title}>
                <span className="eyebrow">
                  Announced {formatDate(look.datedOn)}
                </span>
                <h3>{look.title}</h3>
                <p>{look.text}</p>
                <SourceLink source={look.source} standalone />
              </article>
            ))}
            <div className="row">
              <Link href="/gear?category=clothing" className="btn">
                Explore tennis clothing
              </Link>
              <Link href="/gear?category=sock" className="tap-link">
                Browse socks →
              </Link>
            </div>
          </section>
        )}

        {storiesForPro(pro.slug).length > 0 && (
          <section className="stack-lg" aria-labelledby="gear-stories">
            <h2 id="gear-stories">Gear stories</h2>
            <div className="grid">
              {storiesForPro(pro.slug).map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </section>
        )}

        <SponsorshipFacts slug={pro.slug} />

        {hasGallery && (
          <section className="stack-lg" aria-labelledby="on-court">
            <div className="stack">
              <h2 id="on-court">On court</h2>
              <p className="muted">
                Clips and photos of {pro.name}. They show the player, not the
                gear in the bag above.
              </p>
            </div>
            <ul
              className={s.gallery}
              aria-label={`Clips and photos of ${pro.name}`}
              tabIndex={0}
            >
              {galleryGifs.map((gif) => (
                <li key={gif.id}>
                  <MediaFrame
                    gif={gif}
                    fallback={null}
                    ratio="4 / 3"
                    autoPlay={false}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
