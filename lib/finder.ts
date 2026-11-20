import { formatDate, products, type Product } from "./catalog";

export type FinderAnswers = {
  surface: "hard" | "clay" | "any";
  /** Maximum spend in USD, or null for no limit. */
  budget: number | null;
  fit: "roomy" | "snug" | "wide" | "unsure";
  cushioning: "heel" | "forefoot" | "unsure";
  line: "mens" | "womens" | "any";
};

export type FinderMatch = {
  product: Product;
  score: number;
  reasons: string[];
  unknowns: string[];
};

const ROOMY_MM = 92;

/**
 * Ranks shoes only on facts the catalog holds. Missing data never earns points,
 * and is returned as an explicit unknown so the buyer can see the gap.
 */
export function rankShoes(answers: FinderAnswers, catalog: Product[] = products): FinderMatch[] {
  const wantedLine = answers.line === "mens" ? "Men's" : answers.line === "womens" ? "Women's" : null;

  const matches = catalog
    .filter((p) => p.category === "shoe")
    .filter((p) => !(wantedLine && p.line && p.line !== wantedLine))
    .filter((p) => !(answers.budget !== null && p.priceUsd !== null && p.priceUsd > answers.budget))
    .filter((p) => answers.surface === "any" || p.surface === null || p.surface === answers.surface)
    .filter((p) => answers.fit !== "wide" || p.wideVariant)
    .map((product) => score(product, answers));

  return matches
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.product.slug.localeCompare(b.product.slug));
}

function score(product: Product, answers: FinderAnswers): FinderMatch {
  const reasons: string[] = [];
  const unknowns: string[] = [];
  let points = 0;

  if (answers.budget !== null) {
    if (product.priceUsd !== null) {
      points += 2;
      const checked = product.priceCheckedOn ? ` on ${formatDate(product.priceCheckedOn)}` : "";
      reasons.push(`$${product.priceUsd}${checked} fits your $${answers.budget} budget`);
    } else {
      unknowns.push("Current price");
    }
  }

  if (answers.surface === "hard") {
    if (product.surface === "hard") {
      points += 2;
      reasons.push("Listed as a hard-court version");
    } else {
      unknowns.push("Court surface");
    }
  } else if (answers.surface === "clay") {
    if (product.surface === "clay") {
      points += 2;
      reasons.push("Listed as a clay-court version; clay performance is not independently reviewed here");
    } else unknowns.push("Clay version");
  }

  if (answers.fit === "wide") {
    if (product.wideVariant) {
      points += 4;
      reasons.push("Sold as a dedicated wide version");
    } else {
      unknowns.push("Wide availability");
    }
  } else if (answers.fit === "roomy" || answers.fit === "snug") {
    if (product.forefootWidthMm !== null) {
      const roomy = product.forefootWidthMm >= ROOMY_MM;
      if (roomy === (answers.fit === "roomy")) {
        points += 3;
        reasons.push(`${product.forefootWidthMm} mm at the ball of the foot in the lab's test shoe`);
      }
    } else {
      unknowns.push("Forefoot width");
    }
  }

  if (answers.cushioning !== "unsure") {
    if (product.cushioning === answers.cushioning) {
      points += 2;
      reasons.push(`Air Zoom sits in the ${product.cushioning}`);
    } else if (product.cushioning === null) {
      unknowns.push("Cushioning location");
    }
  }

  return { product, score: points, reasons, unknowns };
}

/** Hours a pricier pair must last to match a cheaper pair's cost per hour. */
export function breakEvenHours(cheapPrice: number, cheapHours: number, pricierPrice: number): number {
  if (cheapPrice <= 0 || cheapHours <= 0 || pricierPrice <= 0) return 0;
  return pricierPrice / (cheapPrice / cheapHours);
}

export function costPerHour(price: number | null, hours: number | null): number | null {
  if (price === null || hours === null || hours <= 0 || price < 0) return null;
  return price / hours;
}
