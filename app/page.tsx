import Link from "next/link";
import { GapNote, formatDate } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { RESEARCH_DATE, getComparison, getProduct, type Product } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const OWN_GEAR_ENTRY = {
  eyebrow: "From your gear",
  title: "Start with what you own",
};

const ENTRY_POINTS = [
  {
    href: "/pros",
    eyebrow: "From a pro",
    title: "Start with what a pro wears",
    text: "See dated gear with its source, then compare the retail model with a lower-priced choice.",
    action: "Browse pros",
  },
  {
    href: "/gear",
    eyebrow: "From a product",
    title: "Start with a model you found",
    text: "Check its specs and sources, then read what players kept or returned.",
    action: "Browse gear",
  },
];

const GAMES = [
  { href: "/play/finder", title: "Gear Match", text: "Answer a few questions and see which shoes fit, with the unknowns listed." },
  { href: "/play/rally", title: "Spec Rally", text: "Test what you know about the specs. Every fact has a source." },
  { href: "/play/cost", title: "Cost per hour", text: "Work out how long a pricier pair has to last to pay off." },
];

function PriceQuestion() {
  const comparison = getComparison("vapor-12-vs-vapor-pro-3");
  if (!comparison) return null;
  const models = comparison.productSlugs
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => p !== undefined);

  return (
    <section className="stack" aria-labelledby="price-question">
      <span className="eyebrow">The $45 question</span>
      <h2 id="price-question">{comparison.question}</h2>
      <div className="table-scroll" role="region" aria-label={comparison.title} tabIndex={0} style={{ contain: "inline-size" }}>
        <table>
          <thead>
            <tr>
              <th scope="col">What we compared</th>
              {models.map((p) => (
                <th scope="col" key={p.slug}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, i) => (
                  <td key={models[i]?.slug ?? i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {comparison.gap && <GapNote>{comparison.gap}</GapNote>}
      <div className="row">
        <Link href={`/compare/${comparison.slug}`} className="btn btn-primary">
          See the full comparison
        </Link>
        <span className="small muted">Prices checked {formatDate(RESEARCH_DATE)}.</span>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const user = await currentUser();
  const ownGear = user
    ? {
        ...OWN_GEAR_ENTRY,
        href: "/me",
        text: "Add your gear to your locker and log what worked.",
        action: "Open your locker",
      }
    : {
        ...OWN_GEAR_ENTRY,
        href: `/signup?next=${encodeURIComponent("/me")}`,
        text: "List your gear in a locker of your own and log what worked. You will need an account for this one.",
        action: "Create your locker",
      };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>
            See what players <em>tried, kept</em> and returned.
          </h1>
          <p className="lede">
            Find out who uses what, what players thought after buying it, and how to choose your next shoes or racquet.
          </p>
        </div>
      </section>

      <div className="wrap page">
        <section className="stack" aria-labelledby="entry-points">
          <h2 id="entry-points">Where do you want to start?</h2>
          <div className="grid">
            {[...ENTRY_POINTS, ownGear].map((entry) => (
              <Link key={entry.href} href={entry.href} className="card card-link">
                <span className="eyebrow">{entry.eyebrow}</span>
                <h3>{entry.title}</h3>
                <p className="small muted">{entry.text}</p>
                <span className="btn">{entry.action}</span>
              </Link>
            ))}
          </div>
        </section>

        <PriceQuestion />

        <section className="stack" aria-labelledby="play-teaser">
          <span className="eyebrow">Play</span>
          <h2 id="play-teaser">Learn the gear by playing</h2>
          <p className="muted">
            Earn points for useful detail. Points never depend on a positive review or on buying anything.
          </p>
          <div className="grid">
            {GAMES.map((game) => (
              <Link key={game.href} href={game.href} className="card card-link">
                <h3>{game.title}</h3>
                <p className="small muted">{game.text}</p>
              </Link>
            ))}
          </div>
          <div className="row">
            <Link href="/play" className="btn">
              See all of Play
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
