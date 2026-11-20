import {
  customerAverage,
  displayRating,
  ratingCoverage,
  ratingsFor,
  sampleLabel,
  type ShoeRating,
} from "@/lib/shoe-ratings";
import s from "./shoe-ratings.module.css";

const kindLabel = {
  customer: "Customer reviews",
  playtest: "Playtest panel",
  publisher: "Publisher score",
};

export function ShoeRatingLine({ productSlug }: { productSlug: string }) {
  const ratings = ratingsFor(productSlug);
  const average = customerAverage(ratings);
  const panel = ratings.find(
    (rating) => rating.kind === "playtest" && rating.match === "matched",
  );
  if (average)
    return (
      <p className={s.cardLine}>
        ≈ {average.outOf5.toFixed(1)}/5 customers{" "}
        <span>· N = {average.reviewCount} reviews</span>
      </p>
    );
  if (panel)
    return (
      <p className={s.cardLine}>
        {displayRating(panel.value)}/{panel.scale} playtest{" "}
        <span>· N = {panel.sampleSize} testers</span>
      </p>
    );
  return null;
}

function SourceRating({
  rating,
  expanded,
}: {
  rating: ShoeRating;
  expanded: boolean;
}) {
  const metrics = rating.metrics.filter((metric) =>
    [
      "Comfort",
      "Support / stability",
      "Outsole durability",
      "Traction",
      "Speed",
      "Stability",
      "Cushioning",
    ].includes(metric.label),
  );
  return (
    <details className={s.source} open={expanded || undefined}>
      <summary>
        <span className={s.sourceName}>
          {rating.publisher}
          <span className={s.subtle}>
            {kindLabel[rating.kind]}
            {rating.match === "context" ? " · Related variant" : ""}
          </span>
        </span>
        <span className={s.sourceScore}>
          {displayRating(rating.value)}
          <small> / {rating.scale}</small>
          <span className={s.subtle}>{sampleLabel(rating)}</span>
        </span>
        <span className={s.scope}>{rating.scope}</span>
      </summary>
      <div className={s.sourceBody}>
        {metrics.length > 0 && (
          <dl className={s.metrics}>
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  {displayRating(metric.value)}
                  <small> / {metric.scale}</small>
                </dd>
              </div>
            ))}
          </dl>
        )}
        {rating.panel && (
          <p className={s.note}>
            Panel: {rating.panel.join(", ")}. N counts the listed playtesters,
            not customer reviews.
          </p>
        )}
        {rating.notes && <p className={s.note}>{rating.notes}</p>}
        <a
          className={s.sourceLink}
          href={rating.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read {rating.publisher} source
          <span className="sr-only">
            {" "}
            for {rating.scope} (opens a new tab)
          </span>{" "}
          ↗
        </a>
      </div>
    </details>
  );
}

/** Static, sourced snapshots. No third-party scripts or live scraping on page requests. */
export default function ShoeRatings({ productSlug }: { productSlug: string }) {
  const coverage = ratingCoverage.find(
    (item) => item.productSlug === productSlug,
  );
  if (!coverage) return null;
  const observations = ratingsFor(productSlug);
  const average = customerAverage(observations);
  const matchedExperts = observations.filter(
    (rating) => rating.match === "matched" && rating.kind !== "customer",
  );
  const primaryPanel = matchedExperts.find(
    (rating) => rating.kind === "playtest",
  );
  const id = `ratings-${productSlug}`;
  return (
    <section
      className={s.section}
      aria-labelledby={id}
      data-shoe-ratings={productSlug}
    >
      <div className={s.heading}>
        <span className="eyebrow">More than a verdict</span>
        <h2 id={id}>What the numbers say</h2>
        <p>
          Buyer stars, on-court playtests and publisher scores, with the sample
          behind each.
        </p>
      </div>
      <div className={s.overview}>
        {average && (
          <div className={s.average}>
            <span className={s.label}>
              {average.sourceCount > 1
                ? "Pooled customer average"
                : "Customer average"}
            </span>
            <p className={s.bigScore}>
              ≈ {average.outOf5.toFixed(1)}
              <small> / 5</small>
            </p>
            <p className={s.count}>
              N = {average.reviewCount.toLocaleString("en-US")} listed reviews ·{" "}
              {average.sourceCount}{" "}
              {average.sourceCount === 1 ? "source" : "sources"}
            </p>
            <p className={s.note}>
              ≈ {displayRating(average.outOf100)}/100 after scale conversion
            </p>
            <p className={s.note}>
              Review entries; shoppers may overlap across sources.
            </p>
          </div>
        )}
        {matchedExperts.length > 0 && (
          <dl className={s.experts}>
            {matchedExperts.map((rating) => (
              <div key={rating.id}>
                <dt>
                  {rating.publisher}
                  <span className={s.subtle}>{kindLabel[rating.kind]}</span>
                </dt>
                <dd>
                  <strong>
                    {displayRating(rating.value)}
                    <small> / {rating.scale}</small>
                  </strong>
                  <span className={s.subtle}>{sampleLabel(rating)}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {!average && (
        <p className={s.gap}>
          No matched customer average yet. {coverage.note}
        </p>
      )}
      {average && average.reviewCount < 10 && (
        <p className={s.gap}>
          Small sample: fewer than 10 listed reviews. Use these stars as an
          early signal, alongside the fit and performance evidence.
        </p>
      )}
      <div className={s.sources}>
        {observations.map((rating) => (
          <SourceRating
            key={rating.id}
            rating={rating}
            expanded={rating.id === primaryPanel?.id}
          />
        ))}
      </div>
      <details className={s.method}>
        <summary>How to read these ratings</summary>
        <div>
          <p>
            Customer averages are weighted by each source’s published review
            count: sum of (score ÷ scale × N), divided by total N. The /100
            figure is a scale conversion, not a percentage of satisfied players.
            Source scores are often rounded, so the combined figure is
            approximate.
          </p>
          <p>
            N counts published review entries, not verified unique people.
            Stores may share or syndicate reviews, include incentives, or pool
            colours, widths and surfaces. We count one listing per known shared
            pool, but cross-store overlap is unknown. This is a descriptive
            snapshot, not a scientific sample or confidence rating.
          </p>
          <p>
            Playtest panels and publisher scores are shown separately and never
            enter customer averages. “N not published” means the source does not
            expose the count. Panel feature-score counts are not individually
            published. Related variants stay out of the headline figures. A high
            score cannot guarantee your fit.
          </p>
          <p>{coverage.note}</p>
        </div>
      </details>
      <p className={s.checked}>
        Sources checked {coverage.checkedOn}. Ratings are snapshots and may have
        changed.
      </p>
    </section>
  );
}
