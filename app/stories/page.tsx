import type { Metadata } from "next";
import Link from "next/link";
import StoryCard from "@/components/StoryCard";
import { gearStories } from "@/lib/editorial";
import s from "@/components/journeys.module.css";
export const metadata: Metadata = {
  title: "Gear stories",
  description:
    "Documented pro gear changes and first-hand player experiences. What changed, what worked and what remains unknown.",
};
export default function StoriesPage() {
  return (
    <div className="wrap page">
      <header className={s.intro}>
        <span className="eyebrow">Behind the switch</span>
        <h1 className={s.title}>Every keeper has a story.</h1>
        <p className="lede">
          Start with a pro’s documented gear change. Then compare it with the
          experiences of players like you.
        </p>
      </header>
      <section className="stack-lg" aria-labelledby="pro-stories">
        <h2 id="pro-stories">From the tour</h2>
        <p className="muted">
          Historical reporting with dated sources. These are editorial stories,
          separate from member reviews.
        </p>
        <div className={s.grid}>
          {gearStories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
      <section className={`card ${s.quiet}`}>
        <h2>What happened on your court?</h2>
        <p>
          Kept, returned or still testing: the useful part is why. Read member
          reports with their size, surface and hours where provided.
        </p>
        <div className="cta-row">
          <Link href="/community" className="btn btn-primary">
            Read player reports
          </Link>
          <Link href="/report/new" className="btn">
            Tell your gear story
          </Link>
        </div>
      </section>
      <Link href="/switch" className="btn btn-optic">
        Find your next pair
      </Link>
    </div>
  );
}
