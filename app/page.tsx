import Link from "next/link";
import MediaFrame, { ProImage, ProductImage } from "@/components/MediaFrame";
import { getProduct, getPro, productLabel, products } from "@/lib/catalog";
import { homeMedia } from "@/lib/media";
import s from "@/components/journeys.module.css";

const categories = [
  {
    category: "shoe",
    title: "Shoes",
    example: "asics-solution-speed-ff-4",
    text: "Fit, cushioning and support. Understand what each pair does well and what to check when you try it on.",
  },
  {
    category: "racquet",
    title: "Racquets",
    example: "babolat-pure-aero-98-gen9",
    text: "Power, spin and control. Compare the stock specifications and the tradeoffs before your next demo.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section
        className={`band band-cream ${s.hero}`}
        aria-labelledby="hero-title"
      >
        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.intro}>
            <span className="eyebrow">Tennis gear, clearly explained</span>
            <h1 id="hero-title" className={s.title}>
              Good gear.
              <br />
              <span className={s.pop}>Clear choices.</span>
            </h1>
            <p className="lede">
              Explore shoes and racquets, understand their strengths and
              tradeoffs, and see what the pros play with.
            </p>
            <div className="cta-row">
              <Link href="/gear" className="btn btn-optic btn-lg">
                Explore the catalogue
              </Link>
              <Link href="/pros" className="btn btn-lg">
                Explore the pros
              </Link>
            </div>
            <p className="small muted">
              Sourced advice. Dated pro gear. Every comparison open to explore.
            </p>
          </div>
          <div className={s.heroPhoto}>
            <MediaFrame
              photo={homeMedia.photos[1]}
              fallback={null}
              ratio="4 / 3"
              eager
            />
          </div>
        </div>
      </section>
      <section
        className={`wrap ${s.section}`}
        aria-labelledby="catalogue-title"
      >
        <div className={s.heading}>
          <div className="stack">
            <span className="eyebrow">The catalogue</span>
            <h2 id="catalogue-title">What are you looking for?</h2>
          </div>
          <Link href="/gear" className="tap-link">
            Browse all {products.length} models →
          </Link>
        </div>
        <div className={`${s.grid} ${s.pair}`}>
          {categories.map((group) => {
            const example = getProduct(group.example)!;
            const count = products.filter(
              (p) => p.category === group.category,
            ).length;
            return (
              <article className="card stack" key={group.category}>
                <ProductImage product={example} ratio="16 / 10" />
                <h3>{group.title}</h3>
                <p>{group.text}</p>
                <p className="small muted">
                  Pictured:{" "}
                  <Link href={`/gear/${example.slug}`}>
                    {productLabel(example)}
                  </Link>
                </p>
                <Link
                  href={`/gear?category=${group.category}`}
                  className="btn btn-primary"
                >
                  Explore {count} {group.title.toLowerCase()} →
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <section className="band band-hardcourt" aria-labelledby="pros-title">
        <div className="wrap stack-lg">
          <div className={s.heading}>
            <div className="stack">
              <span className="eyebrow">From the tour</span>
              <h2 id="pros-title">The player. The gear. The story.</h2>
            </div>
            <Link href="/pros" className="btn">
              Explore all pros →
            </Link>
          </div>
          <p className="lede">
            Open a player's bag to explore their equipment, court style and the
            stories behind their gear changes.
          </p>
          <div className={`${s.grid} ${s.pair}`}>
            {["carlos-alcaraz", "iga-swiatek"].map((slug) => {
              const pro = getPro(slug)!;
              return (
                <article className="card stack" key={slug}>
                  <ProImage slug={slug} prefer="photo" ratio="16 / 10" />
                  <h3>{pro.name}</h3>
                  <Link href={`/pros/${slug}`} className="btn">
                    Explore {pro.name.split(" ")[0]}’s gear →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
