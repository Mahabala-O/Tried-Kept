import { reviewSources } from "./editorial";
import { expandedProducts, expandedPros, brandBag, librarySources, LIBRARY_CHECKED } from "./catalog-expansion";
import { expandedComparisons } from "./comparison-library";

/**
 * Seed catalog. Product facts come from tennis_gear_buyer_research.pdf
 * (U.S. market, checked November 18, 2026). Pro gear added on November 19,
 * 2026 comes from the dated sources named on each item. A value no source
 * states stays null and the UI labels it as a gap. Never fill one in by guessing.
 */

export const RESEARCH_DATE = "2026-11-18";
export const CATALOG_CHECKED = LIBRARY_CHECKED;

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
  surface: "hard" | "clay" | null;
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
  // Pro gear sources added November 19, 2026. Each one was read on that day.
  rgShoes26: { label: "The Second Serve: 2026 Roland-Garros shoe report", url: "https://www.thesecondserve.com/?p=135077" },
  yonexAO26: { label: "Yonex: Team Yonex at the 2026 Australian Open", url: "https://www.yonex.co.uk/blogs/tennis/team-yonex-shines-at-the-australian-open-2026-in-melbourne-s-summer-heat" },
  speedSinner: { label: "TennisNerd: HEAD Speed Sinner goes retail", url: "https://www.tennisnerd.net/?p=70689" },
  siSabalenka: { label: "Sports Illustrated: Sabalenka debuts Wilson's newest racquet", url: "https://www.si.com/onsi/serve/news/aryna-sabalenka-debuts-wilson-newest-tennis-racket" },
  boom26: { label: "TennisNerd: HEAD Boom 2026", url: "https://www.tennisnerd.net/?p=62579" },
  tfightIG: { label: "TennisNerd: Tecnifibre T-Fight I.G. signature racquet", url: "https://www.tennisnerd.net/?p=65199" },
  sheltonGear: { label: "Tennis.com: Geared Up with Ben Shelton", url: "https://www.tennis.com/baseline/articles/geared-up-ben-shelton-takes-aim-at-the-top-10-with-yonex-and-on" },
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
  ...expandedProducts,
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
    line: "Men's",
    surface: "hard",
    forefootWidthMm: 93.8,
    weightG: 393,
    specs: [
      { label: "Interior width at ball of foot (lab test shoe)", value: "93.8 mm", source: reviewSources.res9 },
      { label: "Width near big toe (lab test shoe)", value: "66.6 mm", source: reviewSources.res9 },
      { label: "Weight (lab test shoe)", value: "393 g", source: reviewSources.res9 },
    ],
    summary: "A secure, durable shoe in the men’s lab test, with a tapered toe area and some break-in. Players also discuss alternatives in the linked forum thread.",
    sources: [S.res9Thread, S.res10Thread, reviewSources.res9],
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
    line: "Men's",
    surface: "hard",
    sku: "1041A532-100",
    priceUsd: 160,
    priceCheckedOn: "2026-11-19",
    forefootWidthMm: 97.5,
    weightG: 337,
    specs: [
      { label: "U.S. price (checked Nov 19, 2026)", value: "$160", source: reviewSources.speedShop },
      { label: "Interior width at ball of foot (lab test shoe)", value: "97.5 mm", source: reviewSources.speed4 },
      { label: "Toe height (lab test shoe)", value: "20.6 mm", source: reviewSources.speed4 },
      { label: "Weight (lab test shoe)", value: "337 g", source: reviewSources.speed4 },
    ],
    offers: [{ id: "asics-speed-ff-4-asics", retailerId: "asics", url: reviewSources.speedShop.url, checkedOn: "2026-11-19" }],
    summary: "A lighter shoe in the men’s lab test with a softer midsole. Its broad forefoot measurement comes with a shallow toe box, so try-on fit matters.",
    sources: [S.res9Thread, reviewSources.speed4, reviewSources.speedStore, reviewSources.speedShop],
  },
  {
    ...blank,
    slug: "yonex-eclipsion-5",
    name: "Eclipsion 5",
    brand: "Yonex",
    category: "shoe",
    specs: [{ label: "Retailer playtest version", value: "Men's hard-court shoe; a separate women's version also exists", source: reviewSources.eclipsion }],
    summary: "Retailer testers liked the men’s version for support and durability, with bulk as a tradeoff. Yonex also makes a separate women’s version.",
    sources: [S.res9Thread, S.yonexAO26],
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
    line: "Men's",
    surface: "hard",
    specs: [{ label: "Playtest version", value: "Men's, tested on hard courts", source: reviewSources.hyper3 }],
    summary: "The newer Hypercourt Express. Men’s retailer testers liked its cushioning and forefoot space; sizing, bulk and breathability were tradeoffs.",
    sources: [S.kswissOwner],
  },
  {
    ...blank,
    slug: "yonex-ezone-98-2022",
    name: "EZONE 98 (2022)",
    brand: "Yonex",
    category: "racquet",
    summary: "The older, more accessible EZONE 98. One shopper asked whether it was worth buying over the 2025 frame.",
    sources: [S.ezoneThread, S.twEzone, S.sheltonGear],
  },
  {
    ...blank,
    slug: "yonex-ezone-98-2025",
    name: "EZONE 98 (2025)",
    brand: "Yonex",
    category: "racquet",
    summary: "The newer EZONE 98. Tennis Warehouse playtested it against the 2022 frame with the same string and tension.",
    sources: [S.ezoneThread, S.twEzone],
  },
  /* Pro gear, added November 19, 2026 */
  {
    ...blank,
    slug: "nike-gp-challenge-1-5",
    name: "GP Challenge 1.5",
    brand: "Nike",
    category: "shoe",
    summary: "A Nike hard-court and all-court tennis shoe. No price, fit or weight has been recorded yet.",
    sources: [S.rgShoes26],
  },
  {
    ...blank,
    slug: "nike-zoom-nxt",
    name: "Zoom NXT",
    brand: "Nike",
    category: "shoe",
    summary: "A Nike model that The Second Serve described as discontinued in May 2026, so new pairs may be hard to find.",
    sources: [S.rgShoes26],
  },
  {
    ...blank,
    slug: "new-balance-coco-cg2",
    name: "Coco CG2",
    brand: "New Balance",
    category: "shoe",
    line: "Women's",
    surface: "hard",
    specs: [
      { label: "Retailer playtest version", value: "Women's; B and D widths were tested", source: reviewSources.coco },
      { label: "Interior width (women's US 9.5 B test shoe)", value: "90.9 mm; not directly comparable across sizes", source: reviewSources.cocoLab },
    ],
    summary: "A supportive mid-cut signature shoe. Women’s retailer testers liked the cushioning and durability, but some found the grip too sticky and the feel bulky.",
    sources: [S.rgShoes26],
  },
  {
    ...blank,
    slug: "on-the-roger-pro-fire",
    name: "THE ROGER Pro Fire",
    brand: "On",
    category: "shoe",
    summary: "A version of On's THE ROGER Pro. No price, fit or weight has been recorded yet.",
    sources: [S.rgShoes26],
  },
  {
    ...blank,
    slug: "on-the-roger-pro-3-clay",
    name: "THE ROGER Pro 3 Clay",
    brand: "On",
    category: "shoe",
    summary: "The clay-court version of On's THE ROGER Pro 3. No price, fit or weight has been recorded yet.",
    sources: [S.rgShoes26],
  },
  {
    ...blank,
    slug: "head-speed-sinner-2026",
    name: "Speed Sinner 2026",
    brand: "HEAD",
    category: "racquet",
    weightG: 304,
    summary: "A retail Speed with HEAD-confirmed specs from TennisNerd: 100 sq in, 304 g unstrung, 16x19.",
    specs: [
      { label: "Head size", value: "100 sq in", source: S.speedSinner },
      { label: "Weight (unstrung)", value: "304 g", source: S.speedSinner },
      { label: "Balance (unstrung)", value: "324 mm", source: S.speedSinner },
      { label: "String pattern", value: "16x19", source: S.speedSinner },
    ],
    sources: [S.speedSinner],
  },
  {
    ...blank,
    slug: "wilson-blade-v10",
    name: "Blade v10",
    brand: "Wilson",
    category: "racquet",
    summary: "Wilson's tenth-generation Blade, launched in April 2026. The head size and pattern aren't recorded here, because the line has several.",
    sources: [S.siSabalenka],
  },
  {
    ...blank,
    slug: "head-boom-2026",
    name: "Boom (2026)",
    brand: "HEAD",
    category: "racquet",
    summary: "HEAD's 2026 Boom line, which comes in several head sizes and weights. No single model is recorded here yet.",
    sources: [S.boom26],
  },
  {
    ...blank,
    slug: "yonex-ezone-100",
    name: "EZONE 100",
    brand: "Yonex",
    category: "racquet",
    summary: "The 100 sq in EZONE. No price, weight or string pattern has been recorded yet.",
    sources: [S.yonexAO26],
  },
  {
    ...blank,
    slug: "yonex-vcore-100",
    name: "VCORE 100",
    brand: "Yonex",
    category: "racquet",
    summary: "Yonex's 100 sq in VCORE. No price, weight or string pattern has been recorded yet.",
    sources: [S.yonexAO26],
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
    [isShoe && product.line === null, "retail line (men's or women's)"],
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
  /** A checked listing date is not an observation of match use. */
  evidenceType?: "brand-listed" | "retail-reference";
  /** A retail alternative in the endorsed family, not a model identification. */
  familyAlternative?: boolean;
  evidence: string;
  source: Source;
};

export type Tour = "ATP" | "WTA";

export const TOUR_LABELS: Record<Tour, string> = { ATP: "Men's tour (ATP)", WTA: "Women's tour (WTA)" };

export type Pro = {
  slug: string;
  name: string;
  tour: Tour;
  caveat: string;
  bag: BagItem[];
};

/** A gear page may show a pro stock or custom frame, so every pro carries this unless a source says more. */
const STOCK_CAVEAT = "Pros often play custom or pro stock versions, so the retail model may differ from the one in the match.";

export const pros: Pro[] = [
  {
    slug: "carlos-alcaraz",
    name: "Carlos Alcaraz",
    tour: "ATP",
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
      brandBag("Racquet", "babolat-pure-aero-98-gen9", librarySources.alcaraz,
        "Babolat lists Pure Aero 98 Gen9 on its Alcaraz equipment page. Checked November 19, 2026; this is the endorsed retail reference, not proof of his exact match build."),
    ],
  },
  {
    slug: "jannik-sinner",
    name: "Jannik Sinner",
    tour: "ATP",
    caveat: "TennisNerd reports that his match frame is a customized pro stock HEAD, heavier than the retail Speed Sinner.",
    bag: [
      {
        slot: "Shoes",
        productSlug: "nike-gp-challenge-1-5",
        identifiedOn: "2026-05-28",
        evidence: "The Second Serve's Roland-Garros shoe report, published May 28, 2026, names the GP Challenge 1.5.",
        source: S.rgShoes26,
      },
      {
        slot: "Racquet",
        productSlug: "head-speed-sinner-2026",
        identifiedOn: "2026-11-16",
        evidence:
          "TennisNerd covered HEAD's retail version of his racquet on November 16, 2026. HEAD calls it as close as possible to his setup, and TennisNerd says his own frames are heavier customized pro stock.",
        source: S.speedSinner,
      },
    ],
  },
  {
    slug: "casper-ruud",
    name: "Casper Ruud",
    tour: "ATP",
    caveat: STOCK_CAVEAT,
    bag: [
      {
        slot: "Shoes",
        productSlug: "yonex-eclipsion-5",
        identifiedOn: "2026-01-22",
        evidence: "Yonex's Australian Open post of January 22, 2026 lists the men's Power Cushion Eclipsion 5.",
        source: S.yonexAO26,
      },
      {
        slot: "Racquet",
        productSlug: "yonex-ezone-100",
        identifiedOn: "2026-01-22",
        evidence: "The same Yonex post lists the EZONE 100, strung with Polytour Spin and Polytour Pro.",
        source: S.yonexAO26,
      },
    ],
  },
  {
    slug: "ben-shelton",
    name: "Ben Shelton",
    tour: "ATP",
    caveat: STOCK_CAVEAT,
    bag: [
      {
        slot: "Shoes",
        productSlug: "on-the-roger-pro-3-clay",
        identifiedOn: "2026-05-28",
        evidence: "The Second Serve's Roland-Garros shoe report, published May 28, 2026, names THE ROGER Pro 3 Clay in thistle and pink.",
        source: S.rgShoes26,
      },
      {
        slot: "Racquet",
        productSlug: "yonex-ezone-98-2022",
        identifiedOn: "2024-07-30",
        evidence:
          "Tennis.com named the Aqua Night Black EZONE 98 on July 30, 2024, before the 2025 frame came out. No newer dated identification has been recorded yet.",
        source: S.sheltonGear,
      },
    ],
  },
  {
    slug: "aryna-sabalenka",
    name: "Aryna Sabalenka",
    tour: "WTA",
    caveat: STOCK_CAVEAT,
    bag: [
      {
        slot: "Shoes",
        productSlug: "nike-zoom-nxt",
        identifiedOn: "2026-05-28",
        evidence:
          "The Second Serve's Roland-Garros shoe report, published May 28, 2026, says she went back to a discontinued Nike Zoom NXT, so it may be hard to buy new.",
        source: S.rgShoes26,
      },
      {
        slot: "Racquet",
        productSlug: "wilson-blade-v10",
        identifiedOn: "2026-04-16",
        evidence:
          "Sports Illustrated quoted her on April 16, 2026, the day the Blade v10 launched, saying she was excited to compete with it. The article does not give the head size or string pattern.",
        source: S.siSabalenka,
      },
    ],
  },
  {
    slug: "coco-gauff",
    name: "Coco Gauff",
    tour: "WTA",
    caveat: STOCK_CAVEAT,
    bag: [
      {
        slot: "Shoes",
        productSlug: "new-balance-coco-cg2",
        identifiedOn: "2026-05-28",
        evidence: "The Second Serve's Roland-Garros shoe report, published May 28, 2026, names her signature Coco CG2.",
        source: S.rgShoes26,
      },
      {
        slot: "Racquet",
        productSlug: "head-boom-2026",
        identifiedOn: "2026-01-12",
        evidence:
          "TennisNerd saw her playing a lavender Boom 2026 at the United Cup, in a post dated January 12, 2026. It does not say which Boom model.",
        source: S.boom26,
      },
    ],
  },
  {
    slug: "iga-swiatek",
    name: "Iga Swiatek",
    tour: "WTA",
    caveat: STOCK_CAVEAT,
    bag: [
      {
        slot: "Shoes",
        productSlug: "on-the-roger-pro-fire",
        identifiedOn: "2026-05-28",
        evidence: "The Second Serve's Roland-Garros shoe report, published May 28, 2026, names THE ROGER Pro Fire in bloom and black.",
        source: S.rgShoes26,
      },
      {
        slot: "Racquet",
        productSlug: null,
        identifiedOn: null,
        evidence:
          "Tecnifibre released a T-Fight I.G. signature line in April 2026 in 98 and 100 sq in versions, but no dated source says which one she plays.",
        source: S.tfightIG,
      },
    ],
  },
  {
    slug: "elena-rybakina",
    name: "Elena Rybakina",
    tour: "WTA",
    caveat: STOCK_CAVEAT,
    bag: [
      {
        slot: "Shoes",
        productSlug: "yonex-eclipsion-5",
        identifiedOn: "2026-01-22",
        evidence:
          "Yonex's Australian Open post of January 22, 2026 lists the women's Power Cushion Eclipsion 5. The Second Serve saw the clay version at Roland-Garros in May.",
        source: S.yonexAO26,
      },
      {
        slot: "Racquet",
        productSlug: "yonex-vcore-100",
        identifiedOn: "2026-01-22",
        evidence: "The same Yonex post lists the VCORE 100, strung with Polytour Fire.",
        source: S.yonexAO26,
      },
    ],
  },
  ...expandedPros,
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
  ...expandedComparisons,
  {
    slug: "resolution-9-vs-solution-speed-ff-4",
    title: "Resolution 9 vs Solution Speed FF 4",
    question: "Keep the support, change the feel?",
    productSlugs: ["asics-gel-resolution-9", "asics-solution-speed-ff-4"],
    takeaway: "The FF 4 is lighter in the lab's test shoes and wider at the ball of the foot, but its low toe height can still feel restrictive. Treat this as a try-on comparison, not evidence that it fits every Resolution wearer.",
    rows: [
      { label: "Weight, lab test shoe", values: ["393 g", "337 g"], valueSources: [reviewSources.res9, reviewSources.speed4] },
      { label: "Interior width at ball of foot, lab test shoe", values: ["93.8 mm", "97.5 mm"], valueSources: [reviewSources.res9, reviewSources.speed4] },
      { label: "Width near big toe, lab test shoe", values: ["66.6 mm", "69.1 mm"], valueSources: [reviewSources.res9, reviewSources.speed4] },
      { label: "Toe height, lab test shoe", values: ["23.8 mm", "20.6 mm"], valueSources: [reviewSources.res9, reviewSources.speed4] },
      { label: "Main fit check", values: ["Toe taper and break-in", "Toe height and heel hold"], valueSources: [reviewSources.res9, reviewSources.speed4] },
    ],
    firsthand: [{ productSlug: "asics-solution-speed-ff-4", learned: "One owner found their usual size too small and later reported comfort half a size up. Other owners still found that increase small. These individual accounts do not establish a sizing rule.", source: reviewSources.speedForum }],
    gap: "Measurements describe the lab's test pairs, not every size, width or outsole. We do not have a matched, same-player trial of both models. The Resolution 9's current price is not recorded.",
    sources: [reviewSources.res9, reviewSources.speed4, reviewSources.speedStore, reviewSources.speedForum],
  },
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
