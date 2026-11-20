import Link from "next/link";
import { ProImage, ProductImage } from "@/components/MediaFrame";
import KeeperCourt from "@/components/home/KeeperCourt";
import { getProduct, getPro, productLabel, products } from "@/lib/catalog";
import s from "./home.module.css";

const categories = [
  {
    category: "shoe",
    title: "Shoes",
    example: "nike-vapor-pro-3",
    text: "Fast feet, happy feet. Find the fit, cushioning and support that suit your court time.",
  },
  {
    category: "racquet",
    title: "Racquets",
    example: "yonex-vcore-98-2026",
    text: "More spin? A little control? Get to know the tradeoffs before your next demo.",
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
              Find your
              <br />
              next <span className={s.pop}>keeper.</span>
            </h1>
            <p className="lede">
              Find gear that fits your game. Get to know the tradeoffs. See what
              the pros play with.
            </p>
          </div>
          <KeeperCourt />
          <div className={s.actions}>
            <div className={s.ctas}>
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
              <article
                className={`card stack ${s.categoryCard}`}
                key={group.category}
              >
                <ProductImage product={example} ratio="16 / 10" />
                <h3 className={s.categoryName}>{group.title}</h3>
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
                <article
                  className={`card stack ${s.proCard}`}
                  key={slug}
                  aria-labelledby={`home-${slug}`}
                >
                  <ProImage
                    slug={slug}
                    prefer="gif"
                    autoPlay={false}
                    ratio="4 / 3"
                  />
                  <h3 id={`home-${slug}`} className={s.proName}>
                    {pro.name}
                  </h3>
                  <p className="muted">
                    {slug === "carlos-alcaraz"
                      ? "Big energy. A bag with a story. Explore the gear behind the player."
                      : "Every detail has a purpose. Explore Iga’s equipment and gear-switch story."}
                  </p>
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
