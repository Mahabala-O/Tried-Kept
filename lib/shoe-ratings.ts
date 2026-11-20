import data from "./shoe-ratings-data.json";

export type RatingKind = "customer" | "playtest" | "publisher";
export type ShoeRating = {
  id: string;
  productSlug: string;
  publisher: string;
  url: string;
  kind: RatingKind;
  value: number;
  scale: number;
  sampleSize: number | null;
  sampleUnit: string;
  scope: string;
  match: "matched" | "context";
  /** One canonical observation per shared/syndicated pool, regardless of colour. */
  poolId: string;
  checkedOn: string;
  notes: string;
  metrics: { label: string; value: number; scale: number }[];
  panel?: string[];
};

export const shoeRatings = data.observations as ShoeRating[];
export const ratingCoverage = data.coverage;

/** Scale conversion only: 4/5 = 80/100, not an 80% satisfaction probability. */
export function ratingOutOf100(value: number, scale: number): number | null {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(scale) ||
    scale <= 0 ||
    value < 0 ||
    value > scale
  )
    return null;
  return (value / scale) * 100;
}

export function ratingsFor(productSlug: string): ShoeRating[] {
  return shoeRatings.filter((rating) => rating.productSlug === productSlug);
}

/** Never mix panels, publisher scores, related variants or unknown N into buyer stars. */
export function customerAverage(observations: readonly ShoeRating[]) {
  const pools = new Map<string, ShoeRating>();
  for (const rating of observations) {
    if (
      rating.kind !== "customer" ||
      rating.match !== "matched" ||
      ratingOutOf100(rating.value, rating.scale) === null ||
      rating.sampleSize === null ||
      !Number.isSafeInteger(rating.sampleSize) ||
      rating.sampleSize <= 0
    )
      continue;
    // Reject mixed-product calls rather than silently combine different shoes.
    const key = `${rating.productSlug}:${rating.poolId}`;
    const old = pools.get(key);
    if (!old || rating.checkedOn > old.checkedOn) pools.set(key, rating);
  }
  const included = [...pools.values()];
  if (
    !included.length ||
    new Set(included.map((rating) => rating.productSlug)).size !== 1
  )
    return null;
  const reviewCount = included.reduce(
    (total, rating) => total + rating.sampleSize!,
    0,
  );
  const outOf100 =
    included.reduce(
      (total, rating) =>
        total +
        ratingOutOf100(rating.value, rating.scale)! * rating.sampleSize!,
      0,
    ) / reviewCount;
  return {
    outOf100,
    outOf5: outOf100 / 20,
    reviewCount,
    sourceCount: included.length,
    included,
  };
}

export function displayRating(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
    value,
  );
}

export function sampleLabel(rating: ShoeRating) {
  if (rating.sampleSize === null)
    return rating.kind === "playtest"
      ? "Tester count not shared"
      : "Review count not shared";
  const count = rating.sampleSize.toLocaleString("en-US");
  return rating.kind === "playtest"
    ? `Tested by ${count} ${rating.sampleSize === 1 ? "player" : "players"}`
    : `${count} customer ${rating.sampleSize === 1 ? "review" : "reviews"}`;
}

export function customerReviewLabel(
  average: NonNullable<ReturnType<typeof customerAverage>>,
) {
  const count = average.reviewCount.toLocaleString("en-US");
  return `Based on ${count} ${average.reviewCount === 1 ? "review" : "reviews"} ${average.sourceCount === 1 ? "from 1 site" : `across ${average.sourceCount} sites`}`;
}

/** Plain editorial prompts, not statistical confidence levels or a reliability score.
 * A half-star spread flags different site averages; it does not establish why they differ.
 * The count is review entries, so neither more sites nor more entries proves independence. */
export function customerGuidance(observations: readonly ShoeRating[]) {
  const average = customerAverage(observations);
  if (!average) return null;
  if (average.reviewCount < 10)
    return {
      title: "Only a few reviews so far",
      detail:
        "Treat the stars as a first impression. Read the fit comments and try the shoe on before choosing.",
    };
  if (average.sourceCount === 1)
    return {
      title: "One site’s view",
      detail:
        "These reviews all come from the same site. Check the comments about size, width and comfort before choosing.",
    };
  const scores = average.included.map(
    (rating) => ratingOutOf100(rating.value, rating.scale)! / 20,
  );
  const lowest = Math.min(...scores),
    highest = Math.max(...scores);
  if (highest - lowest >= 0.5 - 1e-9)
    return {
      title: "Ratings vary by site",
      detail: `Site averages range from ${lowest.toFixed(1)} to ${highest.toFixed(1)} out of 5. Read the fit comments before relying on the combined stars; the sites may include different versions or reviewers.`,
    };
  return {
    title: "Similar ratings across sites",
    detail:
      "The site averages are close. Some reviews may appear on more than one site, and a good rating still can’t tell you whether the shoe will fit.",
  };
}

const metricDescriptions: Record<string, { label: string; meaning: string }> = {
  Comfort: { label: "Comfort", meaning: "How comfortable it felt during play" },
  "Support / stability": {
    label: "Side-to-side support",
    meaning: "Support when moving and changing direction",
  },
  "Outsole durability": {
    label: "Sole wear",
    meaning: "How well the sole held up during testing",
  },
  Traction: {
    label: "Grip",
    meaning: "Grip when stopping and changing direction",
  },
  Speed: { label: "Speed", meaning: "The review’s score for quick movement" },
  Stability: {
    label: "Stability",
    meaning: "The review’s score for support and steadiness",
  },
  Cushioning: {
    label: "Cushioning",
    meaning: "The review’s score for cushioning underfoot",
  },
};

export function performanceScores(rating: ShoeRating) {
  return rating.metrics.flatMap((metric) => {
    const description = metricDescriptions[metric.label];
    const normalized = ratingOutOf100(metric.value, metric.scale);
    return description && normalized !== null
      ? [{ ...metric, ...description, normalized }]
      : [];
  });
}

/** Compare features only inside a matching on-court review. No cross-publisher
 * feature averages, inferred fit, or claims of statistically significant differences. */
export function performanceSummary(rating: ShoeRating) {
  if (rating.kind !== "playtest" || rating.match !== "matched") return null;
  const metrics = performanceScores(rating);
  if (metrics.length < 2) return null;
  const highest = Math.max(...metrics.map((metric) => metric.normalized));
  const lowest = Math.min(...metrics.map((metric) => metric.normalized));
  if (highest - lowest < 5 - 1e-9) return null;
  const high = metrics.filter(
    (metric) => Math.abs(metric.normalized - highest) < 1e-9,
  );
  const low = metrics.filter(
    (metric) => Math.abs(metric.normalized - lowest) < 1e-9,
  );
  const names = (items: typeof metrics) =>
    new Intl.ListFormat("en-US", { style: "long", type: "conjunction" }).format(
      items.map((metric) => metric.label.toLowerCase()),
    );
  return `Among the areas shown below, ${names(high)} got the highest ${high.length === 1 ? "mark" : "marks"}. ${names(low).replace(/^./, (letter) => letter.toUpperCase())} scored lower in the same test.`;
}
