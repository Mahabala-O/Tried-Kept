import { sponsorships, SPONSORSHIP_CHECKED } from "@/lib/sponsorships";
import { formatDate, SourceLink } from "./ui";
import s from "@/app/pros/pros.module.css";

export default function SponsorshipFacts({ slug }: { slug: string }) {
  const deals = sponsorships[slug];
  if (!deals?.length) return null;
  return (
    <section
      id="partnerships"
      className="stack-lg"
      aria-labelledby="partnerships-title"
    >
      <div className="stack">
        <h2 id="partnerships-title">The deals behind the kit</h2>
        <p className="muted">
          Dated announcements and reported figures. Deal value, annual earnings
          and a retail product endorsement are different things.
        </p>
      </div>
      {deals.map((deal) => (
        <article className={`card ${s.partnership}`} key={deal.brand}>
          <p className="small muted">{deal.scope}</p>
          <h3>{deal.brand}</h3>
          <dl className={s.dealFacts}>
            <div>
              <dt>
                {deal.valueStatus === "reported" ? "Reported value" : "Value"}
              </dt>
              <dd>{deal.value}</dd>
            </div>
            <div>
              <dt>Term</dt>
              <dd>{deal.term}</dd>
            </div>
          </dl>
          <p>{deal.fact}</p>
          <p className="small muted">
            Source dated {formatDate(deal.datedOn)} · Checked{" "}
            {formatDate(SPONSORSHIP_CHECKED)}
          </p>
          <SourceLink source={deal.source} standalone />
        </article>
      ))}
    </section>
  );
}
