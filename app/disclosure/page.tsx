import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import BallArt from "@/components/art/BallArt";
import { SourceLink, formatDate } from "@/components/ui";
import { RESEARCH_DATE, sources } from "@/lib/catalog";
import s from "./disclosure.module.css";

export const metadata: Metadata = {
  title: "Disclosure",
  description: "How affiliate links, evidence, dates, points and lab data work on Tried & Kept.",
};

const SECTIONS = [
  { id: "affiliate", title: "Affiliate links" },
  { id: "evidence", title: "Evidence and dates" },
  { id: "points", title: "Editorial recommendations" },
  { id: "lab-data", title: "Lab data" },
  { id: "your-data", title: "Your data" },
] as const;

const PROMISES = ["Some links may earn a commission", "Missing facts stay missing", "No points for praise"];

function Section({ index, children }: { index: number; children: ReactNode }) {
  const { id, title } = SECTIONS[index];
  return (
    <section id={id} className={`card ${s.section}`} aria-labelledby={`${id}-title`}>
      <div className={s.sectionHead}>
        <span className={s.num} aria-hidden="true">
          {index + 1}
        </span>
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function DisclosurePage() {
  return (
    <>
      <section className={`band band-optic ${s.hero}`} aria-labelledby="disclosure-title">
        <div className={`wrap ${s.heroCopy}`}>
          <span className="eyebrow">The fine print, in plain words</span>
          <h1 id="disclosure-title" className={s.heroTitle}>
            How this site works
          </h1>
          <p className="lede">How we make money, where our facts come from, and what they can and cannot tell you.</p>
          <ul className={s.promises}>
            {PROMISES.map((line) => (
              <li key={line} className={s.promise}>
                <BallArt className={s.promiseBall} />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="wrap page">
        <nav aria-label="On this page">
          <ul className={`chip-scroll ${s.jump}`}>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="chip">
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.sections}>
          <Section index={0}>
            <p>
              Some links to retailers are affiliate links. If you buy something after using one, we may earn a commission at
              no cost to you.
            </p>
            <p>
              Retailer buttons say &ldquo;Check price at&rdquo; and the retailer&apos;s name. When you use one, we record which
              offer you chose, which part of the site you came from, and your account if you are logged in. Then we send you to
              the retailer.
            </p>
            <p>Gear Match ranks shoes only on the facts we hold. Commissions play no part in its results.</p>
          </Section>

          <Section index={1}>
            <p>
              The original research covers the U.S. market and was checked on {formatDate(RESEARCH_DATE)}. Later facts and prices carry their own check dates. Prices can change after that
              date, and we do not confirm stock or size availability.
            </p>
            <p>When we do not have a fact, we label it as missing. We do not estimate it or fill it in from a similar model.</p>
            <p>
              Pro gear distinguishes dated reports from checked brand listings and retail references. Family alternatives are labeled; a listing check is not a match observation. A pro may use a custom or different
              model from the retail version, and may have changed gear since that date.
            </p>
            <p>
              Forum replies are short accounts from individual players. Player reports on this site are written by members, and
              we do not verify their purchases. Treat both as one person&apos;s experience.
            </p>
          </Section>

          <Section index={2}>
            <p>The switch planner offers editorial candidates based on the priority, sizing line and surface you select. These are starting points for a trial, not a personalized fit prediction or a claim that one shoe is best.</p>
            <p>Strengths and cautions distinguish independent lab tests, retailer playtests and individual forum experiences. Retailers sell the products they review. Pro stories describe dated historical reporting, separately from member reports.</p>
            <p>Affiliate commissions never determine which candidates appear.</p>
          </Section>

          <Section index={3}>
            <p>
              Weights and interior widths come from RunRepeat&apos;s lab. They describe the shoes it tested, so your size and
              width may measure differently. Use them to compare models, then confirm the fit on your own foot.
            </p>
            <SourceLink source={sources.rrMethods} standalone />
          </Section>

          <Section index={4}>
            <p>
              <Link href="/privacy">Our privacy page</Link> covers what we store, how long we keep it and how to delete your
              account.
            </p>
            <p>
              <Link href="/credits">Photo and GIF credits</Link> lists who made each picture and under which license.
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}
