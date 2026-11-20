import Link from "next/link";
import { ProImage } from "@/components/MediaFrame";
import StoryCard from "@/components/StoryCard";
import s from "@/components/journeys.module.css";
import { gearStories } from "@/lib/editorial";
import { products, productLabel, pros } from "@/lib/catalog";

export default function HomePage() {
  const featured = gearStories[0];
  return (
    <>
      <section
        className={`band band-cream ${s.hero}`}
        aria-labelledby="hero-title"
      >
        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.intro}>
            <span className="eyebrow">Tennis gear, with a story</span>
            <h1 id="hero-title" className={s.title}>
              Find your next <span className={s.pop}>keeper.</span>
            </h1>
            <p className="lede">
              See what the pros wear. Find out what players tried, kept or sent
              back—and why it might work for you.
            </p>
            <div className="cta-row">
              <Link href="/pros" className="btn btn-optic btn-lg">
                Explore pro setups
              </Link>
              <Link href="/discover" className="btn btn-lg">
                Find my version
              </Link>
            </div>
            <p className="small muted">
              Dated pro gear. Attributed experiences. Strengths and tradeoffs
              before the shop link.
            </p>
          </div>
          <article className={`card ${s.heroPhoto}`}>
            <ProImage
              slug={featured.proSlug}
              ratio="4 / 3"
              eager
              note="Player portrait; this story covers a historical shoe trial."
            />
            <span className="eyebrow">Iga Swiatek · Behind the switch</span>
            <h2>
              <Link href={`/stories/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p>{featured.dek}</p>
            <Link href={`/stories/${featured.slug}`} className="tap-link">
              Read the story →
            </Link>
          </article>
        </div>
      </section>
      <section className={`wrap ${s.section}`} aria-labelledby="own-gear">
        <div className={s.intro}>
          <span className="eyebrow">From your court</span>
          <h2 id="own-gear">Love the game. Question the gear.</h2>
          <p className="lede">
            Too tight? Too bulky? Worn through already? Start with the gear you
            know, then investigate what could change.
          </p>
        </div>
        <form action="/switch" className={s.form}>
          <div className="field">
            <label htmlFor="home-current">What’s in your bag now?</label>
            <select id="home-current" name="current" defaultValue="">
              <option value="">Choose your current gear</option>
              {["shoe", "racquet"].map((category) => (
                <optgroup
                  key={category}
                  label={category === "shoe" ? "Shoes" : "Racquets"}
                >
                  {products
                    .filter((p) => p.category === category)
                    .map((p) => (
                      <option value={p.slug} key={p.slug}>
                        {productLabel(p)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Explore my next move
          </button>
        </form>
      </section>
      <section className="band band-hardcourt" aria-labelledby="stories-title">
        <div className="wrap stack-lg">
          <div className={s.heading}>
            <div className="stack">
              <span className="eyebrow">Behind the switch</span>
              <h2 id="stories-title">Different players. Different keepers.</h2>
            </div>
            <Link href="/stories" className="btn">
              All gear stories
            </Link>
          </div>
          <p className="lede">
            Documented stories from the tour. A better question than “what’s
            best?” is “what changed for them?”
          </p>
          <div className={s.grid}>
            {gearStories.slice(1).map((story) => (
              <StoryCard story={story} key={story.slug} />
            ))}
            <article className={`card ${s.story}`}>
              <span className="eyebrow">Your turn</span>
              <h3>Kept it? Sent it back? Say why.</h3>
              <p>
                Give the next player the context you wished you’d had: your old
                pair, the fit, your court, and the hours you actually played.
              </p>
              <Link href="/community" className="btn">
                Read player reports
              </Link>
              <Link href="/report/new" className="btn btn-optic">
                Tell your gear story
              </Link>
            </article>
          </div>
        </div>
      </section>
      <section className={`wrap ${s.section}`} aria-labelledby="tour-bags">
        <div className={s.heading}>
          <div className="stack">
            <span className="eyebrow">The tour locker room</span>
            <h2 id="tour-bags">Whose setup are you curious about?</h2>
          </div>
          <Link href="/pros" className="tap-link">
            Explore every dated bag →
          </Link>
        </div>
        <div className={s.tools}>
          {pros.filter(p => ["carlos-alcaraz", "iga-swiatek", "coco-gauff", "novak-djokovic", "jannik-sinner", "naomi-osaka", "jessica-pegula", "ben-shelton"].includes(p.slug)).map((pro) => (
            <Link href={`/pros/${pro.slug}`} className="chip" key={pro.slug}>
              {pro.name}
            </Link>
          ))}
        </div>
        <p className="small muted">
          Retail models can differ from custom pro gear. Every identification
          includes its date and evidence.
        </p>
      </section>
    </>
  );
}
