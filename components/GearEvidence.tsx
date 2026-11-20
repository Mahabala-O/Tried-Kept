import {
  gearBriefs,
  EDITORIAL_CHECKED,
  type EvidenceKind,
} from "@/lib/editorial";
import { formatDate, SourceLink } from "./ui";
import s from "./journeys.module.css";
import { getProduct } from "@/lib/catalog";

const reviewLabels: Record<EvidenceKind, string> = {
  "Manufacturer specification": "Brand specifications",
  "Player interview": "Player interview",
  "Brand announcement": "Brand announcement",
  "Retailer playtest": "On-court review",
  "Independent lab": "Lab test",
  "Forum anecdote": "Player discussion",
};

export default function GearEvidence({ productSlug }: { productSlug: string }) {
  const brief = gearBriefs[productSlug];
  if (!brief) return null;
  return (
    <section className={s.brief} aria-labelledby={`evidence-${productSlug}`}>
      <div className="stack">
        <span className="eyebrow">The fit, the feel, the tradeoffs</span>
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
            ? "What to try on court"
            : "What to check when trying it on"}
        </h3>
        <p>{brief.tryThis}</p>
      </div>
      <details className={s.evidence}>
        <summary>
          Reviews, tests and sources ({brief.evidence.length}{" "}
          {brief.evidence.length === 1 ? "source" : "sources"})
        </summary>
        <p className="small muted">
          We summarised these reviews and checked the links on{" "}
          {formatDate(EDITORIAL_CHECKED)}. Stores sell the products they review.
          Forum posts are personal experiences we haven’t independently checked.
          Our buying advice is our interpretation of these sources.
        </p>
        <ul className={`${s.evidence} list-plain`}>
          {brief.evidence.map((item) => (
            <li key={item.source.url}>
              <span className="eyebrow">{reviewLabels[item.kind]}</span>
              <p>{item.summary}</p>
              <SourceLink source={item.source} standalone />
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
