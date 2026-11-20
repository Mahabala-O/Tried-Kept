import {
  customerAverage,
  customerGuidance,
  customerReviewLabel,
  displayRating,
  performanceScores,
  performanceSummary,
  ratingCoverage,
  ratingsFor,
  sampleLabel,
  type ShoeRating,
} from "@/lib/shoe-ratings";
import { formatDate } from "@/lib/catalog";
import s from "./shoe-ratings.module.css";

const kindLabel = {
  customer: "Customer reviews",
  playtest: "On-court test",
  publisher: "Expert review",
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
        {average.outOf5.toFixed(1)} out of 5 · Customer rating
        <span className={s.cardCount}>{customerReviewLabel(average)}</span>
      </p>
    );
  if (panel)
    return (
      <p className={s.cardLine}>
        {displayRating(panel.value)} out of {panel.scale} · On-court test
        <span className={s.cardCount}>{sampleLabel(panel)}</span>
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
  const metrics = performanceScores(rating);
  const takeaway = performanceSummary(rating);
  return (
    <details className={s.source} open={expanded || undefined}>
      <summary>
        <span className={s.sourceName}>
          {rating.publisher}
          <span className={s.subtle}>{kindLabel[rating.kind]}</span>
        </span>
        <span className={s.sourceScore}>
          {displayRating(rating.value)}
          <small> out of {rating.scale}</small>
          <span className={s.subtle}>{sampleLabel(rating)}</span>
        </span>
        <span className={s.scope}>
          {rating.match === "context" && (
            <strong>Different or unconfirmed version. </strong>
          )}
          {rating.scope}
        </span>
      </summary>
      <div className={s.sourceBody}>
        {takeaway && <p className={s.takeaway}>{takeaway}</p>}
        {metrics.length > 0 && (
          <dl className={s.metrics}>
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>
                  {metric.label}
                  <span className={s.metricMeaning}>{metric.meaning}</span>
                </dt>
                <dd>
                  {displayRating(metric.value)}
                  <small> out of {metric.scale}</small>
                </dd>
              </div>
            ))}
          </dl>
        )}
        {rating.panel && (
          <p className={s.note}>
            Tested on court by {rating.panel.join(", ")}. Their scores are
            separate from customer stars.
          </p>
        )}
        {rating.notes && <p className={s.note}>{rating.notes}</p>}
        <a
          className={s.sourceLink}
          href={rating.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {rating.kind === "customer"
            ? "Read customer reviews at"
            : "Read the full review at"}{" "}
          {rating.publisher}
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
  const guidance = customerGuidance(observations);
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
        <span className="eyebrow">Reviews, made useful</span>
        <h2 id={id}>How players rate it</h2>
        <p>
          See what customers and reviewers thought, how many reviews each score
          uses, and what to check before buying.
        </p>
      </div>
      <div className={s.overview}>
        {average && (
          <div className={s.average}>
            <span className={s.label}>Customer rating</span>
            <p className={s.bigScore}>
              {average.outOf5.toFixed(1)}
              <small> out of 5</small>
            </p>
            <p className={s.count}>{customerReviewLabel(average)}</p>
            {guidance && (
              <div className={s.guidance}>
                <p className={s.label}>{guidance.title}</p>
                <p>{guidance.detail}</p>
              </div>
            )}
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
                    <small> out of {rating.scale}</small>
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
          We don’t have a customer rating for this exact version yet.{" "}
          {coverage.note}
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
        <summary>Where the scores come from</summary>
        <div>
          <p>
            We combine customer stars from the sites listed here. A site with
            more reviews has more influence on the result. We convert different
            rating scales to stars out of five and round the result, so treat it
            as a guide rather than an exact measurement.
          </p>
          <p>
            The review count is the total shown by those sites. The same
            person’s review may appear on more than one site. We avoid counting
            review collections we know are shared twice, but we can’t spot every
            repeat. Some reviews may be rewarded, and a store may group
            different colours, widths or soles together.
          </p>
          <p>
            On-court tests and expert reviews stay separate from customer stars.
            We show how many players took part when the reviewer shares that
            number. A score for another version doesn’t go into this version’s
            headline rating. A good score still can’t tell you whether the shoe
            will fit.
          </p>
          <p>{coverage.note}</p>
          <p>
            “Only a few reviews” is a reminder when there are fewer than 10
            reviews. “Ratings vary by site” means the site averages differ by at
            least half a star. These are reading tips, not proof that a score is
            reliable or that one shoe is better.
          </p>
        </div>
      </details>
      <p className={s.checked}>
        Checked {formatDate(coverage.checkedOn)}. Sites may have newer reviews
        now.
      </p>
    </section>
  );
}
