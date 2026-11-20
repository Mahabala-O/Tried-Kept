import type { Metadata } from "next";
import Link from "next/link";
import { ProImage, ProductImage } from "@/components/MediaFrame";
import { GapNote, SourceLink, formatDate } from "@/components/ui";
import {
  TOUR_LABELS,
  getProduct,
  productLabel,
  pros,
  type Pro,
  type Tour,
} from "@/lib/catalog";
import s from "./pros.module.css";

export const metadata: Metadata = {
  title: "Pros",
  description:
    "Pro tennis gear with the date it was identified, the evidence and the source.",
};

const RULES = [
  {
    title: "Always dated",
    text: "Every item shows the day it was identified and who identified it.",
  },
  {
    title: "Always sourced",
    text: "Each date links to the page that says so, so you can check it.",
  },
  {
    title: "Not a promise",
    text: "A pro may use a custom or different model, and may have changed gear since.",
  },
];

export default function ProsPage() {
  const datedCount = pros.reduce(
    (n, pro) =>
      n +
      pro.bag.filter(
        (item) => item.productSlug !== null && item.identifiedOn !== null,
      ).length,
    0,
  );

  return (
    <>
      <section
        className={`band band-hardcourt court-lines ${s.hero}`}
        aria-labelledby="pros-title"
      >
        <div className={`wrap ${s.heroCopy}`}>
          <span className="eyebrow">Pro bags</span>
          <h1 id="pros-title" className={s.heroTitle}>
            Pros
          </h1>
          <p className="lede">
            Pros change gear, so every entry shows when it was identified and
            who identified it.
          </p>
          <div className={s.heroStats}>
            <span className="sticker sticker-xp sticker-plain tilt-left">
              {pros.length} {pros.length === 1 ? "pro" : "pros"}
            </span>
            <span className="sticker sticker-paper sticker-plain tilt-right">
              {datedCount} dated{" "}
              {datedCount === 1 ? "identification" : "identifications"}
            </span>
          </div>
        </div>
      </section>

      <div className="wrap page">
        {pros.length === 0 && (
          <GapNote>No pro gear has been recorded yet.</GapNote>
        )}

        {TOURS.map((tour) => {
          const list = pros.filter((pro) => pro.tour === tour);
          if (list.length === 0) return null;
          return (
            <section
              key={tour}
              className="stack"
              aria-labelledby={`tour-${tour}`}
            >
              <h2 id={`tour-${tour}`}>{TOUR_LABELS[tour]}</h2>
              <div className={s.proGrid}>
                {list.map((pro) => (
                  <ProCard key={pro.slug} pro={pro} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="stack-lg" aria-labelledby="pro-rules">
          <h2 id="pro-rules">How we show pro gear</h2>
          <ol className={s.rules}>
            {RULES.map((rule, i) => (
              <li key={rule.title} className={s.rule}>
                <span className={s.ruleNum} aria-hidden="true">
                  {i + 1}
                </span>
                <div className="stack">
                  <h3>{rule.title}</h3>
                  <p className="small muted">{rule.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/disclosure" className="tap-link">
            More on evidence and dates
          </Link>
        </section>
      </div>
    </>
  );
}

const TOURS: Tour[] = ["ATP", "WTA"];

function ProCard({ pro }: { pro: Pro }) {
  const dated = pro.bag.filter(
    (item) => item.productSlug !== null && item.identifiedOn !== null,
  );
  const undated = pro.bag.filter(
    (item) => item.productSlug === null || item.identifiedOn === null,
  );
  return (
    <article className={`card ${s.proCard}`}>
      <ProImage slug={pro.slug} prefer="photo" ratio="1 / 1" />
      <h3 className={s.proName}>
        <Link href={`/pros/${pro.slug}`}>{pro.name}</Link>
      </h3>
      {dated.length === 0 && (
        <GapNote>No dated gear identification is recorded yet.</GapNote>
      )}
      <ul className={s.miniBag} aria-label={`${pro.name}'s dated gear`}>
        {dated.map((item) => {
          const product = getProduct(item.productSlug as string);
          if (!product) return null;
          return (
            <li key={item.slot} className={s.miniItem}>
              <ProductImage product={product} ratio="1 / 1">
                <div className={s.miniText}>
                  <span className={s.miniSlot}>{item.slot}</span>
                  <Link href={`/gear/${product.slug}`} className={s.miniName}>
                    {productLabel(product)}
                  </Link>
                  <span className="sticker sticker-blue sticker-sm sticker-plain sticker-wrap tilt-none">
                    Identified {formatDate(item.identifiedOn as string)}
                  </span>
                  <SourceLink source={item.source} standalone />
                </div>
              </ProductImage>
            </li>
          );
        })}
        {undated.map((item) => (
          <li key={item.slot} className={`${s.miniItem} ${s.miniUnknown}`}>
            <span className={s.qTile} aria-hidden="true">
              ?
            </span>
            <div className={s.miniText}>
              <span className={s.miniSlot}>{item.slot}</span>
              <span className="small">Not identified yet</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="small muted">{pro.caveat}</p>
      <div className="cta-row">
        <Link href={`/pros/${pro.slug}`} className="btn btn-primary">
          See the full bag
        </Link>
      </div>
    </article>
  );
}
