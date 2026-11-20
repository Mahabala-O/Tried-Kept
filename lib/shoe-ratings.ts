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
  if (rating.sampleSize === null) return "N not published";
  return `N = ${rating.sampleSize.toLocaleString("en-US")} ${rating.sampleUnit}`;
}
