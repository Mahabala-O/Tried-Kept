/**
 * Seed catalog. Every fact here comes from tennis_gear_buyer_research.pdf
 * (U.S. market, checked November 18, 2026). A value the research does not
 * state stays null and the UI labels it as a gap. Never fill one in by guessing.
 */

export const RESEARCH_DATE = "2026-11-18";

export type Source = { label: string; url: string };
export type Category = "shoe" | "racquet";

export type Spec = { label: string; value: string; source: Source };

export type Offer = {
  id: string;
  retailerId: RetailerId;
  url: string;
  checkedOn: string;
};

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  /** Retail line, e.g. "Men's". Null when the research does not say. */
  line: string | null;
  surface: "hard" | null;
  wideVariant: boolean;
  priceUsd: number | null;
  /** The day the price was read from the retailer. A price is never shown without it. */
  priceCheckedOn: string | null;
  sku: string | null;
  /** Interior width at the ball of the foot in the lab's test shoe. */
  forefootWidthMm: number | null;
  weightG: number | null;
  cushioning: "heel" | "forefoot" | null;
  summary: string;
  specs: Spec[];
  offers: Offer[];
  sources: Source[];
};

export type RetailerId = "nike" | "asics";

export type Retailer = {
  id: RetailerId;
  name: string;
  /** Env var holding an approved affiliate link template containing {url}. */
  templateEnv: string;
};

export const retailers: Record<RetailerId, Retailer> = {
  nike: { id: "nike", name: "Nike", templateEnv: "AFFILIATE_TEMPLATE_NIKE" },
  asics: { id: "asics", name: "ASICS", templateEnv: "AFFILIATE_TEMPLATE_ASICS" },
};

const S = {
  nikeV12: { label: "Nike Vapor 12", url: "https://www.nike.com/t/vapor-12-mens-hard-court-tennis-shoes-45fp1Une/FV5552-003" },
  nikePro3: { label: "Nike Vapor Pro 3", url: "https://www.nike.com/t/vapor-pro-3-mens-hard-court-tennis-shoes-SpZRz675/FZ2161-101" },
  rrV12: { label: "RunRepeat Vapor 12 lab test", url: "https://runrepeat.com/nike-vapor-12" },
  rrPro3: { label: "RunRepeat Vapor Pro 3 lab test", url: "https://runrepeat.com/nike-vapor-pro-3" },
  rrMethods: { label: "RunRepeat lab methods", url: "https://runrepeat.com/testing-methodology" },
  kitAlcaraz: { label: "Kit Tennis: Carlos Alcaraz shoes", url: "https://kit.tennis/players/carlos-alcaraz/shoes" },
  babolatAlcaraz: { label: "Babolat: Carlos Alcaraz gear page", url: "https://www.babolat.com/us/carlos-alcaraz-pro-player.html" },
  asicsMensWide: { label: "ASICS men's GEL-Resolution X wide", url: "https://www.asics.com/us/en-us/gel-resolution-x-wide/p/ANA_1041A487-104.html" },
  asicsWomensWide: { label: "ASICS women's GEL-Resolution X wide", url: "https://www.asics.com/us/en-us/gel-resolution-x-wide/p/ANA_1042A278-102.html" },
  res9Thread: { label: "r/10s: GEL-Resolution 9 alternatives", url: "https://www.reddit.com/r/10s/comments/1th2hlm/best_asics_gel_resolution_9_alternatives_in_2026/" },
  res10Thread: { label: "r/10s: what comes close to the 9 in a wide fit", url: "https://www.reddit.com/r/10s/comments/1s65nqp/really_hated_gel_resolution_10_what_would_be/" },
  wideClayThread: { label: "r/10s: wide forefoot, narrow heel on clay", url: "https://www.reddit.com/r/10s/comments/1t0u50h/looking_for_tennis_shoes_with_wide_toe_box_but/" },
  wearThread: { label: "r/10s: shoes wearing out in one spot", url: "https://www.reddit.com/r/10s/comments/1wm4w84/any_tips_on_how_to_make_tennis_shoes_last_longer/" },
  ezoneThread: { label: "r/10s: EZONE 2022 vs 2025", url: "https://www.reddit.com/r/10s/comments/1ohq2gj/ezone_2022_vs_2025/" },
  demoThread: { label: "r/10s: demoing three racquets", url: "https://www.reddit.com/r/10s/comments/1vcwyfd/any_specific_advice_for_demoing_racquets/" },
  restringThread: { label: "r/10s: restringing cost and frequency", url: "https://www.reddit.com/r/10s/comments/1ntsb5h/higher_level_playershow_often_do_you_restring/" },
  twEzone: { label: "Tennis Warehouse EZONE 98 matched-string playtest", url: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/EZ98BBreview.html" },
  twDemo: { label: "Tennis Warehouse demo program", url: "https://www.tennis-warehouse.com/demoprogram.html" },
  twuRacquets: { label: "TWU similar racquets", url: "https://twu.tennis-warehouse.com/learning_center/similartennis.php" },
  twuStrings: { label: "TWU similar strings", url: "https://twu.tennis-warehouse.com/learning_center/similarstrings.php" },
  kswissOwner: { label: "K-Swiss page: one pickleball player's comparison", url: "https://kswiss.com/collections/mens-tennis-shoes/products/04603-002-m" },
  twCrossover: { label: "Tennis Warehouse hard-court crossover models", url: "https://www.tennis-warehouse.com/learning_center/pickleball/best-tennis-shoes-for-pickleball.html" },
} satisfies Record<string, Source>;

export const sources = S;

const CHECKED = RESEARCH_DATE;

const blank: Pick<
  Product,
  "line" | "surface" | "wideVariant" | "priceUsd" | "priceCheckedOn" | "sku" | "forefootWidthMm" | "weightG" | "cushioning" | "specs" | "offers"
> = {
  line: null,
  surface: null,
  wideVariant: false,
  priceUsd: null,
  priceCheckedOn: null,
  sku: null,
  forefootWidthMm: null,
  weightG: null,
  cushioning: null,
  specs: [],
  offers: [],
};

export const products: Product[] = [
  {
    ...blank,
    slug: "nike-vapor-12",
    name: "Vapor 12",
    brand: "Nike",
    category: "shoe",
    line: "Men's",
    surface: "hard",
    priceUsd: 180,
    priceCheckedOn: CHECKED,
    sku: "FV5552-003",
    forefootWidthMm: 89.9,
    weightG: 390,
    cushioning: "heel",
    summary: "The men's retail hard-court version, with heel Air Zoom and less room at the ball of the foot than the Vapor Pro 3 in the lab's test shoe.",
    specs: [
      { label: "U.S. price (checked Nov 18, 2026)", value: "$180", source: S.nikeV12 },
      { label: "Air Zoom location", value: "Heel", source: S.nikeV12 },
      { label: "Weight (lab)", value: "390 g", source: S.rrV12 },
      { label: "Interior width at ball of foot (lab test shoe)", value: "89.9 mm", source: S.rrV12 },
    ],
    offers: [{ id: "nike-vapor-12-nike", retailerId: "nike", url: S.nikeV12.url, checkedOn: CHECKED }],
    sources: [S.nikeV12, S.rrV12, S.kitAlcaraz],
  },
  {
    ...blank,
    slug: "nike-vapor-pro-3",
    name: "Vapor Pro 3",
    brand: "Nike",
    category: "shoe",
    line: "Men's",
    surface: "hard",
    priceUsd: 135,
    priceCheckedOn: CHECKED,
    sku: "FZ2161-101",
    forefootWidthMm: 93.2,
    weightG: 383,
    cushioning: "forefoot",
    summary: "$45 less than the Vapor 12 on Nike's U.S. pages on November 18, 2026, with forefoot Air Zoom and more room at the ball of the foot in the lab's test shoe.",
    specs: [
      { label: "U.S. price (checked Nov 18, 2026)", value: "$135", source: S.nikePro3 },
      { label: "Air Zoom location", value: "Forefoot", source: S.nikePro3 },
      { label: "Weight (lab)", value: "383 g", source: S.rrPro3 },
      { label: "Interior width at ball of foot (lab test shoe)", value: "93.2 mm", source: S.rrPro3 },
    ],
    offers: [{ id: "nike-vapor-pro-3-nike", retailerId: "nike", url: S.nikePro3.url, checkedOn: CHECKED }],
    sources: [S.nikePro3, S.rrPro3],
  },
  {
    ...blank,
    slug: "nike-vapor-pro-2",
    name: "Vapor Pro 2",
    brand: "Nike",
    category: "shoe",
    summary: "The previous Vapor Pro. Owners can log what happened when they tried a Vapor 12 or Vapor Pro 3.",
    sources: [],
  },
  {
    ...blank,
    slug: "asics-gel-resolution-9",
    name: "GEL-Resolution 9",
    brand: "ASICS",
    category: "shoe",
    summary: "r/10s threads in the research ask what should replace it.",
    sources: [S.res9Thread, S.res10Thread],
  },
  {
    ...blank,
    slug: "asics-gel-resolution-x-wide-mens",
    name: "GEL-Resolution X Wide",
    brand: "ASICS",
    category: "shoe",
    line: "Men's",
    wideVariant: true,
    summary: "ASICS publishes this men's wide version as its own product, separate from the standard width.",
    offers: [{ id: "asics-res-x-wide-mens-asics", retailerId: "asics", url: S.asicsMensWide.url, checkedOn: CHECKED }],
    sources: [S.asicsMensWide, S.res10Thread],
  },
  {
    ...blank,
    slug: "asics-gel-resolution-x-wide-womens",
    name: "GEL-Resolution X Wide",
    brand: "ASICS",
    category: "shoe",
    line: "Women's",
    wideVariant: true,
    summary: "ASICS publishes this women's wide version as its own product, separate from the standard width.",
    offers: [{ id: "asics-res-x-wide-womens-asics", retailerId: "asics", url: S.asicsWomensWide.url, checkedOn: CHECKED }],
    sources: [S.asicsWomensWide],
  },
  {
    ...blank,
    slug: "mizuno-wave-exceed-tour-5",
    name: "Wave Exceed Tour 5",
    brand: "Mizuno",
    category: "shoe",
    summary: "One former GEL-Resolution 9 wearer on r/10s found the fit similar.",
    sources: [S.res9Thread],
  },
  {
    ...blank,
    slug: "asics-solution-speed-ff-4",
    name: "Solution Speed FF 4",
    brand: "ASICS",
    category: "shoe",
    summary: "An owner of several Resolution 8s and 9s liked the switch. Another commenter described a quicker-feeling push-off.",
    sources: [S.res9Thread],
  },
  {
    ...blank,
    slug: "yonex-eclipsion-5",
    name: "Eclipsion 5",
    brand: "Yonex",
    category: "shoe",
    summary: "One r/10s player reported a successful switch from the GEL-Resolution 9, with little detail on fit.",
    sources: [S.res9Thread],
  },
  {
    ...blank,
    slug: "k-swiss-hypercourt-express-2",
    name: "Hypercourt Express 2",
    brand: "K-Swiss",
    category: "shoe",
    summary: "One pickleball player compared this pair with the Express 3 on K-Swiss's own product page, including toe room and firmness.",
    sources: [S.kswissOwner],
  },
  {
    ...blank,
    slug: "k-swiss-hypercourt-express-3",
    name: "Hypercourt Express 3",
    brand: "K-Swiss",
    category: "shoe",
    summary: "The newer Hypercourt Express. One pickleball player's note on K-Swiss's page covers toe room and firmness against the Express 2.",
    sources: [S.kswissOwner],
  },
  {
    ...blank,
    slug: "yonex-ezone-98-2022",
    name: "EZONE 98 (2022)",
    brand: "Yonex",
    category: "racquet",
    summary: "The older, more accessible EZONE 98. One shopper asked whether it was worth buying over the 2025 frame.",
    sources: [S.ezoneThread, S.twEzone],
  },
  {
    ...blank,
    slug: "yonex-ezone-98-2025",
    name: "EZONE 98 (2025)",
    brand: "Yonex",
    category: "racquet",
    summary: "The current generation in the research. Tennis Warehouse playtested it against the 2022 frame with the same string and tension.",
    sources: [S.ezoneThread, S.twEzone],
  },
];

export function formatDate(iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z"));
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** A price always travels with the day it was checked. */
export function datedPrice(product: Pick<Product, "priceUsd" | "priceCheckedOn">): string {
  if (product.priceUsd === null) return "Price not recorded";
  const checked = product.priceCheckedOn ? ` on ${formatDate(product.priceCheckedOn)}` : "";
  return `$${product.priceUsd}${checked}`;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getOffer(id: string): { offer: Offer; product: Product } | undefined {
  for (const product of products) {
    const offer = product.offers.find((o) => o.id === id);
    if (offer) return { offer, product };
  }
  return undefined;
}

export function productLabel(p: Product): string {
  return `${p.brand} ${p.name}${p.line ? ` (${p.line})` : ""}`;
}

/** Every fact the research left blank for this model, so the page can label each gap. */
export function missingFacts(product: Product): string[] {
  const isShoe = product.category === "shoe";
  const checks: [boolean, string][] = [
    [product.priceUsd === null, "U.S. price"],
    [product.line === null, "retail line (men's or women's)"],
    [isShoe && product.surface === null, "court surface"],
    [isShoe && product.sku === null, "style number"],
    [isShoe && product.forefootWidthMm === null, "interior width at the ball of the foot"],
    [isShoe && product.cushioning === null, "cushioning location"],
    [product.weightG === null, "weight"],
  ];
  return checks.filter(([isMissing]) => isMissing).map(([, label]) => label);
}

/* Pros ------------------------------------------------------------------ */

export type BagItem = {
  slot: "Shoes" | "Racquet";
  productSlug: string | null;
  /** Date of the identification. Pro gear is only ever shown with a date. */
  identifiedOn: string | null;
  evidence: string;
  source: Source;
};

export type Pro = {
  slug: string;
  name: string;
  caveat: string;
  bag: BagItem[];
};

export const pros: Pro[] = [
  {
    slug: "carlos-alcaraz",
    name: "Carlos Alcaraz",
    caveat: "Babolat's own Alcaraz page says a pro may use a custom or different model from the one pictured.",
    bag: [
      {
        slot: "Shoes",
        productSlug: "nike-vapor-12",
        identifiedOn: "2026-03-13",
        evidence:
          "Kit Tennis dates this identification of the model to March 13, 2026. The version linked here is the men's retail one, which may not be the exact pair he wore.",
        source: S.kitAlcaraz,
      },
      {
        slot: "Racquet",
        productSlug: null,
        identifiedOn: null,
        evidence: "No dated racquet identification has been recorded yet.",
        source: S.babolatAlcaraz,
      },
    ],
  },
];

export function getPro(slug: string): Pro | undefined {
  return pros.find((p) => p.slug === slug);
}

export function prosUsing(productSlug: string): Pro[] {
  return pros.filter((p) => p.bag.some((b) => b.productSlug === productSlug));
}

/* Comparisons ----------------------------------------------------------- */

export type FirsthandReply = {
  productSlug: string;
  learned: string;
  source: Source;
};

export type Comparison = {
  slug: string;
  title: string;
  question: string;
  productSlugs: string[];
  takeaway: string | null;
  /** valueSources holds one source per value. source is a further reference for the whole row. */
  rows: { label: string; values: string[]; valueSources?: Source[]; source?: Source }[];
  firsthand: FirsthandReply[];
  gap: string | null;
  sources: Source[];
};

export const comparisons: Comparison[] = [
  {
    slug: "vapor-12-vs-vapor-pro-3",
    title: "Vapor 12 vs Vapor Pro 3",
    question: "Is the Vapor 12 worth $45 more?",
    productSlugs: ["nike-vapor-12", "nike-vapor-pro-3"],
    takeaway:
      "For a $150 budget and more room at the ball of the foot, try the Pro 3 first. If you prefer a snugger fit and heel cushioning, include the 12 in your try-on.",
    rows: [
      { label: "U.S. price (Nike, Nov 18, 2026)", values: ["$180 · FV5552-003", "$135 · FZ2161-101"] },
      { label: "Air Zoom location, per Nike", values: ["Heel", "Forefoot"] },
      { label: "Weight in RunRepeat's lab", values: ["390 g", "383 g"], valueSources: [S.rrV12, S.rrPro3], source: S.rrMethods },
      { label: "Interior width at ball of foot, test shoe", values: ["89.9 mm", "93.2 mm"], valueSources: [S.rrV12, S.rrPro3], source: S.rrMethods },
    ],
    firsthand: [],
    gap: "The 3.3 mm difference describes the lab's test shoes. Your size and width may differ.",
    sources: [S.nikeV12, S.nikePro3, S.rrV12, S.rrPro3, S.rrMethods],
  },
  {
    slug: "gel-resolution-9-replacements",
    title: "GEL-Resolution 9 replacements",
    question: "What should replace your GEL-Resolution 9?",
    productSlugs: ["mizuno-wave-exceed-tour-5", "asics-solution-speed-ff-4", "yonex-eclipsion-5"],
    takeaway: null,
    rows: [],
    firsthand: [
      {
        productSlug: "mizuno-wave-exceed-tour-5",
        learned: "One former Resolution 9 wearer found the fit similar. Exact sizes and playing hours were unreported.",
        source: S.res9Thread,
      },
      {
        productSlug: "asics-solution-speed-ff-4",
        learned: "An owner of multiple pairs of Resolution 8s and 9s liked the switch. Another commenter described a quicker-feeling push-off.",
        source: S.res9Thread,
      },
      {
        productSlug: "yonex-eclipsion-5",
        learned: "A player explicitly reported a successful switch. The brief comment gives too little detail to predict another player's fit.",
        source: S.res9Thread,
      },
    ],
    gap: "These are three brief replies, some possibly from outside the U.S. Sizes, widths and hours are the missing pieces.",
    sources: [S.res9Thread, S.res10Thread],
  },
  {
    slug: "hypercourt-express-2-vs-3",
    title: "Hypercourt Express 2 vs 3",
    question: "Should you move from the Express 2 to the Express 3?",
    productSlugs: ["k-swiss-hypercourt-express-2", "k-swiss-hypercourt-express-3"],
    takeaway: null,
    rows: [],
    firsthand: [],
    gap: "One pickleball player compared toe room and firmness on K-Swiss's page, so this comes from another sport. The research holds no tennis account of this switch, and prices and measurements are not recorded here yet.",
    sources: [S.kswissOwner],
  },
  {
    slug: "ezone-98-2022-vs-2025",
    title: "EZONE 98: 2022 vs 2025",
    question: "Is the older EZONE 98 worth buying?",
    productSlugs: ["yonex-ezone-98-2022", "yonex-ezone-98-2025"],
    takeaway:
      "Compare frames with the same string and tension, as Tennis Warehouse's playtester did. Then a difference is more likely to come from the frame.",
    rows: [],
    firsthand: [],
    gap: "The real price difference facing a buyer is not recorded here yet.",
    sources: [S.ezoneThread, S.twEzone, S.demoThread, S.twDemo],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function comparisonsFor(productSlug: string): Comparison[] {
  return comparisons.filter((c) => c.productSlugs.includes(productSlug));
}

/** Tennis Warehouse's public demo terms, from the research. */
export const demoProgram = {
  summary: "Tennis Warehouse publicly lists three demos for a week for $25, with a purchase credit under its terms.",
  source: S.twDemo,
};
