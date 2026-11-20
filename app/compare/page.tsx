import Link from "next/link";
import type { Metadata } from "next";
import { comparisons } from "@/lib/catalog";
import CompareCard from "./_components/CompareCard";
import s from "./compare.module.css";

export const metadata: Metadata = {
  title: "Compare",
  description: "Side-by-side tennis gear comparisons that show what is known and what is still missing.",
};

export default function ComparePage() {
  const withTakeaway = comparisons.filter((c) => c.takeaway !== null).length;

  return (
    <>
      <section className={`band band-grass court-lines ${s.hero}`} aria-labelledby="compare-title">
        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <span className="eyebrow">Head to head</span>
            <h1 id="compare-title" className={s.heroTitle}>
              Compare
            </h1>
            <p className="lede">The questions players ask before they buy, with what is known and what is still missing.</p>
            <div className={s.heroStats}>
              <span className="sticker sticker-paper sticker-plain tilt-left">
                {comparisons.length} {comparisons.length === 1 ? "matchup" : "matchups"}
              </span>
              <span className="sticker sticker-xp sticker-plain tilt-right">{withTakeaway} with a takeaway</span>
            </div>
          </div>
          <span className={s.heroVs} aria-hidden="true">
            VS
          </span>
        </div>
      </section>

      <div className="wrap page">
        <Link href="/compare/pick" className="btn btn-optic">Build my own comparison →</Link>
        <div className={s.cards}>
          {comparisons.map((comparison) => (
            <CompareCard key={comparison.slug} comparison={comparison} headingLevel={2} />
          ))}
        </div>
      </div>
    </>
  );
}
