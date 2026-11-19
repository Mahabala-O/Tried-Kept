"use server";

import { revalidatePath } from "next/cache";
import { currentUser, requireUser } from "@/lib/auth";
import { comparisonsFor, datedPrice, getComparison, products, retailers, sources, type Source } from "@/lib/catalog";
import { offerHref } from "@/lib/affiliate";
import { getDb } from "@/lib/db";
import { rankShoes, type FinderAnswers, type FinderMatch } from "@/lib/finder";
import { awardXp, XP } from "@/lib/gamification";
import { quizQuestions } from "@/lib/quiz";

/* Gear Match ------------------------------------------------------------ */

export type GearMatchStart = "pro" | "product" | "own-gear";

export type GearMatchItem = {
  slug: string;
  brand: string;
  name: string;
  line: string | null;
  priceUsd: number | null;
  priceCheckedOn: string | null;
  reasons: string[];
  tradeoffs: string[];
  unknowns: string[];
  offers: { id: string; href: string; retailer: string; checkedOn: string }[];
  comparisons: { slug: string; title: string }[];
};

export type GearMatchGap = { title: string; message: string; source: Source | null };

export type GearMatchState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | {
      status: "done";
      start: GearMatchStart;
      matches: GearMatchItem[];
      gap: GearMatchGap | null;
      notes: string[];
      loggedIn: boolean;
      xpAwarded: number;
      xpAvailable: number;
    };

const STARTS = ["pro", "product", "own-gear"] as const;
const LINES = ["mens", "womens", "any"] as const;
const SURFACES = ["hard", "clay", "any"] as const;
const BUDGETS = ["100", "150", "200", "none"] as const;
const FITS = ["roomy", "snug", "wide", "unsure"] as const;
const CUSHIONING = ["heel", "forefoot", "unsure"] as const;

function pick<T extends string>(allowed: readonly T[], value: FormDataEntryValue | null): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function tradeoffsFor(match: FinderMatch, answers: FinderAnswers): string[] {
  const { product, reasons } = match;
  const notes: string[] = [];

  if (answers.fit === "roomy" || answers.fit === "snug") {
    const fitMatched = reasons.some((r) => r.includes("at the ball of the foot"));
    if (product.forefootWidthMm !== null && !fitMatched) {
      const side = answers.fit === "roomy" ? "roomier" : "snugger";
      notes.push(`${product.forefootWidthMm} mm at the ball of the foot in the lab's test shoe, so not one of the ${side} shoes here`);
    }
  }

  if (answers.cushioning !== "unsure" && product.cushioning !== null && product.cushioning !== answers.cushioning) {
    notes.push(`Air Zoom sits in the ${product.cushioning}, not the ${answers.cushioning}`);
  }

  return notes;
}

function toItem(match: FinderMatch, answers: FinderAnswers): GearMatchItem {
  const { product } = match;
  return {
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    line: product.line,
    priceUsd: product.priceUsd,
    priceCheckedOn: product.priceCheckedOn,
    reasons: match.reasons,
    tradeoffs: tradeoffsFor(match, answers),
    unknowns: match.unknowns,
    offers: product.offers.map((offer) => ({
      id: offer.id,
      href: offerHref(offer.id, "finder"),
      retailer: retailers[offer.retailerId].name,
      checkedOn: offer.checkedOn,
    })),
    comparisons: comparisonsFor(product.slug).map((c) => ({ slug: c.slug, title: c.title })),
  };
}

/** Explains why nothing matched, using only what the catalog does and does not hold. */
function gapFor(answers: FinderAnswers): GearMatchGap {
  if (answers.surface === "clay") {
    return {
      title: "Clay is not covered yet",
      message:
        "No shoe here is recorded as a clay version. A wide forefoot with a narrow heel on clay is also a need we cannot answer yet.",
      source: sources.wideClayThread,
    };
  }

  if (answers.line === "womens" && answers.fit !== "wide") {
    return {
      title: "Women's coverage is thin",
      message:
        "We do not hold enough recorded facts on women's shoes for these answers yet. Choosing a wide fit shows the women's wide model we track.",
      source: null,
    };
  }

  const priced = products
    .filter((p) => p.category === "shoe" && p.priceUsd !== null)
    .sort((a, b) => (a.priceUsd as number) - (b.priceUsd as number));
  const lowest = priced[0] ?? null;
  if (answers.budget !== null && lowest !== null && (lowest.priceUsd as number) > answers.budget) {
    return {
      title: `Nothing recorded at $${answers.budget}`,
      message: `No shoe with a recorded price fits $${answers.budget} yet. The lowest recorded price here is ${datedPrice(lowest)}.`,
      source: null,
    };
  }

  return {
    title: "Nothing to rank on yet",
    message:
      "Your answers left everything open, so we have no recorded fact to rank on. Go again and pick a surface, budget, fit or cushioning.",
    source: null,
  };
}

export async function runGearMatch(_prev: GearMatchState, formData: FormData): Promise<GearMatchState> {
  const start = pick(STARTS, formData.get("start"));
  const line = pick(LINES, formData.get("line"));
  const surface = pick(SURFACES, formData.get("surface"));
  const budget = pick(BUDGETS, formData.get("budget"));
  const fit = pick(FITS, formData.get("fit"));
  const cushioning = pick(CUSHIONING, formData.get("cushioning"));

  if (!start || !line || !surface || !budget || !fit || !cushioning) {
    return { status: "error", error: "One of those answers was not recognized. Start again and pick from the list." };
  }

  const answers: FinderAnswers = {
    line,
    surface,
    fit,
    cushioning,
    budget: budget === "none" ? null : Number(budget),
  };

  const matches = rankShoes(answers).map((match) => toItem(match, answers));
  const notes =
    matches.length > 0 && answers.surface === "clay"
      ? ["No shoe here is confirmed as a clay version. Check the listing before you buy."]
      : [];

  const user = await currentUser();
  const awarded = user ? awardXp(getDb(), user.id, "finder:complete", XP.finderComplete) : false;
  if (awarded) revalidatePath("/", "layout");

  return {
    status: "done",
    start,
    matches,
    gap: matches.length === 0 ? gapFor(answers) : null,
    notes,
    loggedIn: user !== null,
    xpAwarded: awarded ? XP.finderComplete : 0,
    xpAvailable: XP.finderComplete,
  };
}

/* Spec Rally ------------------------------------------------------------ */

export type RallyCheck =
  | {
      ok: true;
      correct: boolean;
      answerIndex: number;
      explanation: string;
      source: Source | null;
      xpAwarded: number;
      alreadyCounted: boolean;
    }
  | { ok: false; error: string };

export async function checkRallyAnswer(questionId: unknown, optionIndex: unknown): Promise<RallyCheck> {
  const question = typeof questionId === "string" ? quizQuestions.find((q) => q.id === questionId) : undefined;
  if (!question) return { ok: false, error: "That question was not recognized." };

  if (
    typeof optionIndex !== "number" ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= question.options.length
  ) {
    return { ok: false, error: "That answer was not recognized. Pick one of the options." };
  }

  const correct = optionIndex === question.answerIndex;
  const user = correct ? await currentUser() : null;
  const awarded = user ? awardXp(getDb(), user.id, `quiz:${question.id}`, XP.quizCorrect) : false;
  if (awarded) revalidatePath("/", "layout");

  return {
    ok: true,
    correct,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
    source: question.source ? { label: question.source.label, url: question.source.url } : null,
    xpAwarded: awarded ? XP.quizCorrect : 0,
    alreadyCounted: user !== null && !awarded,
  };
}

/* Comparison scouting --------------------------------------------------- */

export async function scoutComparison(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = formData.get("slug");
  if (typeof slug !== "string" || slug.length > 100) return;

  const comparison = getComparison(slug);
  if (!comparison) return;

  awardXp(getDb(), user.id, `compare:${comparison.slug}`, XP.comparisonScouted);
  revalidatePath("/", "layout");
}
