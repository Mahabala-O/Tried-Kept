import { gearBriefs, EDITORIAL_CHECKED } from "@/lib/editorial";
import { formatDate, SourceLink } from "./ui";
import s from "./journeys.module.css";
import { evidenceLabel } from "@/lib/discovery";
import { getProduct } from "@/lib/catalog";

export default function GearEvidence({ productSlug }: { productSlug: string }) {
  const brief = gearBriefs[productSlug];
  if (!brief) return null;
  return (
    <section className={s.brief} aria-labelledby={`evidence-${productSlug}`}>
      <div className="stack">
        <span className="eyebrow">The fit, the feel, the tradeoffs</span>
        <span className="small muted">
          Evidence: {evidenceLabel(productSlug)}
        </span>
        <h2 id={`evidence-${productSlug}`}>{brief.verdict}</h2>
        <p>
          <strong>Worth a try for:</strong> {brief.suits}
        </p>
      </div>
      <div className={s.briefColumns}>
        <div>
          <h3>Strong suits</h3>
          <ul className={s.bullets}>
            {brief.strengths.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Watch for</h3>
          <ul className={s.bullets}>
            {brief.cautions.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`callout ${s.brief}`}>
        <h3>
          {getProduct(productSlug)?.category === "racquet"
            ? "Your demo check"
            : "Your try-on check"}
        </h3>
        <p>{brief.tryThis}</p>
      </div>
      <details className={s.evidence}>
        <summary>
          Read the evidence ({brief.evidence.length}{" "}
          {brief.evidence.length === 1 ? "source" : "sources"})
        </summary>
        <p className="small muted">
          Edited summaries, checked {formatDate(EDITORIAL_CHECKED)}. Retailers
          sell these products; forum accounts are unverified personal
          experiences. Suitability is our editorial interpretation.
        </p>
        <ul className={`${s.evidence} list-plain`}>
          {brief.evidence.map((item) => (
            <li key={item.source.url}>
              <span className="eyebrow">{item.kind}</span>
              <p>{item.summary}</p>
              <SourceLink source={item.source} standalone />
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
