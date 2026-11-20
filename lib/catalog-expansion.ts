import type { BagItem, Product, Pro, Source } from "./catalog";
import type { GearBrief, GearPriority } from "./editorial";

/** Checked November 19, 2026. Brand listings are retail references, not a census
 * of match frames. Keep unstrung manufacturer mass separate from strung tests. */
export const LIBRARY_CHECKED = "2026-11-19";
const source = (label: string, url: string): Source => ({ label, url });
export const librarySources = {
  aero: source(
    "Babolat · Pure Aero 98 Gen9 specifications",
    "https://www.babolat.com/us/pure-aero-98-gen9-unstrung/101567.html",
  ),
  alcaraz: source(
    "Babolat · Carlos Alcaraz equipment",
    "https://www.babolat.com/us/carlos-alcaraz-pro-player.html",
  ),
  ezone: source(
    "Yonex · EZONE 98 specifications and athletes",
    "https://www.yonex.com/tennis/racquets/ezone/ez98",
  ),
  percept: source(
    "Yonex · PERCEPT 97 specifications and athletes",
    "https://www.yonex.com/tennis/racquets/percept/percept-97",
  ),
  vcore: source(
    "Yonex · VCORE 100, eighth generation, and athletes",
    "https://www.yonex.com/tennis/racquets/vcore/08vc100",
  ),
  usopen: source(
    "Yonex · US Open equipment, September 2, 2026",
    "https://www.yonex.com/news/popular/summer-success-sets-the-stage-for-the-next-challenge-at-the-us-open-2026/",
  ),
  djokovic: source(
    "HEAD · Novak Djokovic, Speed endorsement",
    "https://www.head.com/en_GB/athletes/tennis/atp/novak-djokovic",
  ),
  zverev: source(
    "HEAD · Gravity Tour Zverev 2026",
    "https://www.head.com/en_SE/product/gravity-tour-zverev-2026-239806",
  ),
  fritz: source(
    "HEAD · Radical story, March 6, 2025",
    "https://www.head.com/en_US/rs/stories/the-racquet-behind-the-racket",
  ),
  speed: source(
    "Tennis Warehouse · Speed MP 2026 playtest (Legend cosmetic)",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/HSPMP6review.html",
  ),
  gravity: source(
    "Tennis Warehouse · Gravity MP 2025 playtest",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/HGMPZ6review.html",
  ),
  radical: source(
    "Tennis Warehouse · Radical MP 2025 playtest",
    "https://www.tenniswarehouse-europe.com/learning_center/racquet_reviews/HRMPPTreview.html?lang=en",
  ),
  radicalSpec: source(
    "HEAD · Radical MP 2025, stock specifications",
    "https://www.head.com/en_US/product/radical-mp-2025-231015",
  ),
  blade: source(
    "Tennis Warehouse · Blade 98 16x19 v10 playtest",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/WB9810review.html",
  ),
  clash: source(
    "Tennis Warehouse · Clash 100 v3 playtest",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/CL103Vreview.html",
  ),
  drive: source(
    "Tennis Warehouse · Pure Drive 2025 playtest",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/BPD25Rreview.html",
  ),
  aeroReview: source(
    "Tennis Warehouse · Pure Aero 98 Gen9 playtest",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/BPA982review.html",
  ),
  vcore98: source(
    "Tennis Warehouse · VCORE 98 eighth-generation playtest",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/VC988Greview.html",
  ),
  tfight: source(
    "Tennis Warehouse · TFight 305S playtest and endorsement",
    "https://www.tennis-warehouse.com/learning_center/racquet_reviews/TF3SIDreview.html",
  ),
  court: source(
    "Tennis Warehouse Europe · men's Court FF 3 hard-court playtest",
    "https://www.tenniswarehouse-europe.com/learning_center/shoe_reviews/asics_court_ff_3_mens.html?lang=en",
  ),
  speedWomen: source(
    "Tennis Warehouse · women's Solution Speed FF 4 playtest",
    "https://www.tennis-warehouse.com/learning_center/shoe_reviews/asics_solution_speed_ff_4_womens.html",
  ),
  resWomen: source(
    "Tennis Warehouse · women's GEL-Resolution X playtest",
    "https://www.tennis-warehouse.com/learning_center/shoe_reviews/asics_gel_resolution_X_womens.html",
  ),
  clayWomen: source(
    "ASICS · women's Solution Speed FF 4 Clay, 1042A305-400",
    "https://www.asics.com/us/en-us/solution-speed-ff-4-clay/p/ANA_1042A305-400.html",
  ),
};

export type RacquetFacts = {
  head: number;
  mass: number;
  massBasis: "Unstrung" | "Strung (retailer test)";
  pattern: string;
  source: Source;
};
export const racquetFacts: Record<string, RacquetFacts> = {
  "babolat-pure-aero-98-gen9": {
    head: 98,
    mass: 305,
    massBasis: "Unstrung",
    pattern: "16 × 20",
    source: librarySources.aero,
  },
  "babolat-pure-drive-2025": {
    head: 100,
    mass: 300,
    massBasis: "Unstrung",
    pattern: "16 × 19",
    source: librarySources.drive,
  },
  "head-speed-mp-2026": {
    head: 100,
    mass: 300,
    massBasis: "Unstrung",
    pattern: "16 × 19",
    source: librarySources.speed,
  },
  "head-gravity-mp-2025": {
    head: 100,
    mass: 295,
    massBasis: "Unstrung",
    pattern: "16 × 20",
    source: librarySources.gravity,
  },
  "head-radical-mp-2025": {
    head: 98,
    mass: 300,
    massBasis: "Unstrung",
    pattern: "16 × 19",
    source: librarySources.radicalSpec,
  },
  "wilson-blade-98-16x19-v10": {
    head: 98,
    mass: 323,
    massBasis: "Strung (retailer test)",
    pattern: "16 × 19",
    source: librarySources.blade,
  },
  "wilson-clash-100-v3": {
    head: 100,
    mass: 295,
    massBasis: "Unstrung",
    pattern: "16 × 19",
    source: librarySources.clash,
  },
  "yonex-vcore-98-2026": {
    head: 98,
    mass: 323,
    massBasis: "Strung (retailer test)",
    pattern: "16 × 19",
    source: librarySources.vcore98,
  },
  "yonex-percept-97": {
    head: 97,
    mass: 310,
    massBasis: "Unstrung",
    pattern: "16 × 19",
    source: librarySources.percept,
  },
  "tecnifibre-tfight-305s": {
    head: 98,
    mass: 305,
    massBasis: "Unstrung",
    pattern: "18 × 19",
    source: librarySources.tfight,
  },
  "yonex-ezone-98-2025": {
    head: 98,
    mass: 305,
    massBasis: "Unstrung",
    pattern: "16 × 19",
    source: librarySources.ezone,
  },
};

const empty = {
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
} satisfies Partial<Product>;
const frames: [string, string, string, string][] = [
  [
    "babolat-pure-aero-98-gen9",
    "Pure Aero 98 Gen9 (2026)",
    "Babolat",
    "A spin-focused 98 with a 16x20 pattern. A retail reference, not a copy of a custom tour frame.",
  ],
  [
    "babolat-pure-drive-2025",
    "Pure Drive (2025)",
    "Babolat",
    "A 100-square-inch power frame. Easy depth comes with a firmer response and a control tradeoff.",
  ],
  [
    "head-speed-mp-2026",
    "Speed MP (2026)",
    "HEAD",
    "A 100-square-inch all-court option. The retailer tested the black Legend cosmetic; its swingweight makes timing worth checking.",
  ],
  [
    "head-gravity-mp-2025",
    "Gravity MP (2025)",
    "HEAD",
    "Feel and control in a 100-square-inch head. The MP is a retail alternative within the Gravity family, not the Zverev Tour model.",
  ],
  [
    "head-radical-mp-2025",
    "Radical MP (2025)",
    "HEAD",
    "A versatile 98 with a control lean. The MP is a retail comparison reference, not a verified pro match frame.",
  ],
  [
    "wilson-blade-98-16x19-v10",
    "Blade 98 16x19 v10",
    "Wilson",
    "One specific retail Blade, distinct from an unidentified frame in the wider Blade v10 range.",
  ],
  [
    "wilson-clash-100-v3",
    "Clash 100 v3",
    "Wilson",
    "A flexible-feeling, maneuverable 100 with accessible power. Stability against heavy pace is the demo question.",
  ],
  [
    "yonex-vcore-98-2026",
    "VCORE 98 (2026, eighth generation)",
    "Yonex",
    "Spin and depth from a 98-square-inch retail frame. Distinct from the VCORE 100 and earlier generations.",
  ],
  [
    "yonex-percept-97",
    "PERCEPT 97",
    "Yonex",
    "A 310 g unstrung, 97-square-inch frame positioned by Yonex for experienced players seeking precision and feel.",
  ],
  [
    "tecnifibre-tfight-305s",
    "TFight 305S",
    "Tecnifibre",
    "A retail 98 with an 18x19 pattern and faster handling than the outgoing model in the retailer's playtest.",
  ],
];
const checkedPrices: Record<string, { value: number; source: Source }> = {
  "babolat-pure-aero-98-gen9": { value: 309, source: librarySources.aero },
  "babolat-pure-drive-2025": {
    value: 299,
    source: source(
      "Babolat U.S. · Pure Drive Gen11",
      "https://www.babolat.com/us/pure-drive-gen11-unstrung/101552.html",
    ),
  },
  "wilson-clash-100-v3": {
    value: 299,
    source: source(
      "Wilson U.S. · Clash 100 v3",
      "https://www.wilson.com/en-us/products/clash-100-v3-tennis-racket-wr17280",
    ),
  },
  "yonex-percept-97": {
    value: 305,
    source: source(
      "Yonex U.S. · PERCEPT 97",
      "https://us.yonex.com/products/percept-97",
    ),
  },
  "yonex-vcore-98-2026": {
    value: 305,
    source: source(
      "Yonex U.S. · VCORE 98 eighth generation",
      "https://us.yonex.com/products/vcore-98",
    ),
  },
};
export const expandedProducts: Product[] = frames.map(
  ([slug, name, brand, summary]) => {
    const f = racquetFacts[slug];
    const price = checkedPrices[slug];
    return {
      ...empty,
      slug,
      name,
      brand,
      summary,
      category: "racquet",
      weightG: f.mass,
      ...(price
        ? { priceUsd: price.value, priceCheckedOn: LIBRARY_CHECKED }
        : {}),
      specs: [
        { label: "Head size", value: `${f.head} in²`, source: f.source },
        {
          label: `Weight · ${f.massBasis.toLowerCase()}`,
          value: `${f.mass} g`,
          source: f.source,
        },
        { label: "String pattern", value: f.pattern, source: f.source },
        ...(price
          ? [
              {
                label: "U.S. listed price · checked November 19, 2026",
                value: `$${price.value}`,
                source: price.source,
              },
            ]
          : []),
      ],
      sources: price ? [f.source, price.source] : [f.source],
    };
  },
);
expandedProducts.push(
  {
    ...empty,
    slug: "asics-court-ff-3",
    name: "Court FF 3",
    brand: "ASICS",
    category: "shoe",
    line: "Men's",
    surface: "hard",
    summary:
      "A supportive men's hard-court shoe with a wraparound fit. The retail playtest covers this version, not every custom pair or clay outsole.",
    sources: [librarySources.court],
  },
  {
    ...empty,
    slug: "asics-solution-speed-ff-4-womens",
    name: "Solution Speed FF 4",
    brand: "ASICS",
    category: "shoe",
    line: "Women's",
    surface: "hard",
    summary:
      "Light-feeling cushioning and movement in the women's retail playtest. Testers went up half a size; that is their experience, not a universal sizing rule.",
    sources: [librarySources.speedWomen],
  },
  {
    ...empty,
    slug: "asics-gel-resolution-x-womens",
    name: "GEL-Resolution X",
    brand: "ASICS",
    category: "shoe",
    line: "Women's",
    surface: "hard",
    summary:
      "The standard women's version, separate from the wide listing. Support and wear resistance are the appeal; fit and weight are the compromises to investigate.",
    sources: [librarySources.resWomen],
  },
  {
    ...empty,
    slug: "asics-solution-speed-ff-4-clay-womens",
    name: "Solution Speed FF 4 Clay",
    brand: "ASICS",
    category: "shoe",
    line: "Women's",
    surface: "clay",
    sku: "1042A305-400",
    summary:
      "A separate women's clay listing. ASICS describes its clay-specific design; the hard-court playtest does not establish clay traction or wear.",
    sources: [librarySources.clayWomen],
  },
);

export function brandBag(
  slot: BagItem["slot"],
  productSlug: string,
  source: Source,
  evidence: string,
): BagItem {
  return {
    slot,
    productSlug,
    source,
    evidence,
    identifiedOn: LIBRARY_CHECKED,
    evidenceType: "brand-listed",
  };
}
const caveat =
  "This is a sourced brand association. The linked retail frame can differ in model, generation, weight, strings and customization from the player's match equipment.";
const frame = (
  slug: string,
  name: string,
  tour: Pro["tour"],
  productSlug: string,
  src: Source,
  evidence: string,
): Pro => ({
  slug,
  name,
  tour,
  caveat,
  bag: [
    {
      ...brandBag("Racquet", productSlug, src, evidence),
      ...(["novak-djokovic", "alexander-zverev", "taylor-fritz"].includes(slug)
        ? { familyAlternative: true }
        : {}),
    },
  ],
});
export const expandedPros: Pro[] = [
  frame(
    "novak-djokovic",
    "Novak Djokovic",
    "ATP",
    "head-speed-mp-2026",
    librarySources.djokovic,
    "HEAD lists a Speed endorsement. The MP here is a retail alternative in that family, not an identification of his exact match frame.",
  ),
  frame(
    "alexander-zverev",
    "Alexander Zverev",
    "ATP",
    "head-gravity-mp-2025",
    librarySources.zverev,
    "HEAD associates Zverev with Gravity and a separate Gravity Tour Zverev 2026. The lighter MP here is a comparison alternative, not that Tour model or his custom frame.",
  ),
  frame(
    "taylor-fritz",
    "Taylor Fritz",
    "ATP",
    "head-radical-mp-2025",
    librarySources.fritz,
    "HEAD's March 2025 Radical story names Fritz. It establishes the family endorsement; the retail MP is a comparison reference.",
  ),
  {
    ...frame(
      "daniil-medvedev",
      "Daniil Medvedev",
      "ATP",
      "tecnifibre-tfight-305s",
      librarySources.tfight,
      "Tennis Warehouse identifies the 305S as the endorsed retail frame. This does not establish his actual match-frame specifications.",
    ),
    bag: [
      {
        slot: "Racquet",
        productSlug: "tecnifibre-tfight-305s",
        identifiedOn: LIBRARY_CHECKED,
        evidenceType: "retail-reference",
        source: librarySources.tfight,
        evidence:
          "The retailer identifies Medvedev's endorsement. Retail 305S specifications are not measurements of his match racquet.",
      },
    ],
  },
  frame(
    "frances-tiafoe",
    "Frances Tiafoe",
    "ATP",
    "yonex-percept-97",
    librarySources.usopen,
    "Yonex's September 2026 equipment list names PERCEPT 97. The linked stock specifications do not describe custom weighting.",
  ),
  frame(
    "arthur-fils",
    "Arthur Fils",
    "ATP",
    "babolat-pure-aero-98-gen9",
    librarySources.aero,
    "Babolat lists Fils among this product's athletes. This is a checked brand listing, not proof of the exact retail frame in a match.",
  ),
  ...[
    ["jessica-pegula", "Jessica Pegula"],
    ["naomi-osaka", "Naomi Osaka"],
    ["madison-keys", "Madison Keys"],
    ["linda-noskova", "Linda Noskova"],
    ["taylor-townsend", "Taylor Townsend"],
  ].map(([slug, name]) =>
    frame(
      slug,
      name,
      "WTA",
      "yonex-ezone-98-2025",
      librarySources.ezone,
      "Yonex lists this player on the EZONE 98 product page. This is a retail reference; exact match build and generation are not verified here.",
    ),
  ),
  frame(
    "jasmine-paolini",
    "Jasmine Paolini",
    "WTA",
    "yonex-vcore-100",
    librarySources.vcore,
    "Yonex's eighth-generation VCORE 100 page lists Paolini. The existing catalog entry is a family reference; her exact match frame and build are not established.",
  ),
];

const brief = (
  verdict: string,
  suits: string,
  strengths: string[],
  cautions: string[],
  priorities: GearPriority[],
  src: Source,
  summary: string,
  tryThis: string,
  manufacturer = false,
): GearBrief => ({
  verdict,
  suits,
  strengths,
  cautions,
  priorities,
  tryThis,
  evidence: [
    {
      kind: manufacturer ? "Brand announcement" : "Retailer playtest",
      source: src,
      summary,
    },
  ],
});
export const expandedBriefs: Record<string, GearBrief> = {
  "babolat-pure-aero-98-gen9": brief(
    "Spin with a smaller target.",
    "Experienced players who generate their own swing speed and want a spin-focused 98.",
    [
      "Retail playtesters liked its spin and precision",
      "16x20 pattern in a 98-square-inch head",
    ],
    [
      "A 98 head and 305 g unstrung demand a deliberate demo",
      "Brand association does not make this a pro's custom frame",
    ],
    ["spin", "control"],
    librarySources.aeroReview,
    "TW's Gen9 playtest praises spin and the quicker frame geometry. The smaller-head suitability judgment here is editorial.",
    "Alternate heavy cross-court balls and flatter approach shots. Count short balls and long misses with the same string setup.",
  ),
  "babolat-pure-drive-2025": brief(
    "Easy depth, with a control tradeoff.",
    "Players seeking help producing pace and depth from the baseline.",
    ["Playtesters found accessible power and spin", "Maneuverable response"],
    ["Testers found the feel firm", "Flatter strokes could fly long"],
    ["power", "spin"],
    librarySources.drive,
    "TW liked its power and handling, while reporting less control and a firm response.",
    "Hit ten neutral rally balls and ten attacking forehands. Check whether extra depth also increases long errors.",
  ),
  "head-speed-mp-2026": brief(
    "A solid hit, if you can keep it moving.",
    "Players wanting a stable all-court 100 and able to sustain its swing through a session.",
    [
      "Playtesters liked impact feel and stability",
      "Power and spin when set up in time",
    ],
    [
      "Some testers lost timing against faster balls",
      "Touch was less convincing for parts of the team",
    ],
    ["power", "control"],
    librarySources.speed,
    "TW tested the Legend cosmetic and found a substantial strung swingweight. Stability did not mean effortless handling for every tester.",
    "Return faster serves and hit late-session groundstrokes. Check timing and fatigue, not just fresh warm-up shots.",
  ),
  "head-gravity-mp-2025": brief(
    "Feel first. Bring your own pace.",
    "Players seeking a control-oriented 100 with a comfortable-feeling response.",
    [
      "Playtesters praised feel and spin",
      "More stable than the preceding MP in their test",
    ],
    [
      "Less free power than some testers wanted",
      "String setup changed their depth and response",
    ],
    ["control", "handling"],
    librarySources.gravity,
    "TW found control and feel especially strong, but lower power than other frames in this specification range.",
    "Use the same string and tension as your baseline. Check depth when defending, then precision when attacking.",
  ),
  "head-radical-mp-2025": brief(
    "Versatile, with a control lean.",
    "All-court players willing to supply pace rather than rely on automatic depth.",
    [
      "The retailer team liked stability and shot variety",
      "Controlled flat shots and slices",
    ],
    [
      "Some testers wanted more put-away power",
      "Off-center contact was less forgiving than their 100s",
    ],
    ["control"],
    librarySources.radical,
    "TW's team found a versatile frame; several needed more effort for attacking pace or quick exchanges.",
    "Mix returns, approach shots and reflex volleys. Compare late contact and put-away success with your current frame.",
  ),
  "wilson-blade-98-16x19-v10": brief(
    "Connected feel with a purposeful swing.",
    "Players who want a 98 for directional control and solid net play.",
    [
      "TW testers liked feel and volley stability",
      "Comfort and a little more power than the previous generation",
    ],
    [
      "Some still wanted easier put-away power",
      "A full session can expose demanding handling",
    ],
    ["control"],
    librarySources.blade,
    "TW's retail v10 test reported strong feel and stability, with differing views on power and muted response.",
    "Try blocked returns and attacking volleys, then repeat at the end of the session. Keep string setup consistent.",
  ),
  "wilson-clash-100-v3": brief(
    "An easier swing, with less mass behind it.",
    "Players who value easy movement and a flexible-feeling power frame.",
    [
      "Retailer testers found accessible power",
      "Comfortable feel and maneuverability",
    ],
    [
      "Some wanted more mass against heavy pace",
      "Stability could suffer on demanding exchanges",
    ],
    ["handling", "power"],
    librarySources.clash,
    "TW praised easy power and handling but found stability and mass less convincing for some experienced testers.",
    "Block a heavy serve and hit on the stretch. Check whether the easy swing still gives you a stable response.",
  ),
  "yonex-vcore-98-2026": brief(
    "Spin and depth that need reining in.",
    "Players seeking a lively 98 with a higher-launching response.",
    ["Playtesters found strong spin access", "More available depth and power"],
    [
      "Some testers found it too powerful",
      "String setup and finishing the swing mattered",
    ],
    ["spin", "power"],
    librarySources.vcore98,
    "TW's eighth-generation review found more power and spin, but some testers struggled with depth control.",
    "Alternate high, heavy cross-court shots with flatter changes of direction. Log long misses before changing tension.",
  ),
  "yonex-percept-97": brief(
    "A precision-oriented frame to demo carefully.",
    "Experienced players comfortable with a 97 head and 310 g unstrung.",
    [
      "Yonex positions it for feel and precision",
      "16x19 pattern and a narrow beam",
    ],
    [
      "Manufacturer positioning only; no independent playtest summarized here",
      "Smaller head and stock mass may make late contact demanding",
    ],
    ["control"],
    librarySources.percept,
    "Yonex describes a frame for advanced precision and feel. We have not established its performance for an individual player.",
    "Compare off-center returns and defensive depth with a 100. Stop if the setup causes discomfort.",
    true,
  ),
  "tecnifibre-tfight-305s": brief(
    "Control with quicker handling than before.",
    "Players who want a controlled 98 without the outgoing model's heavier swing feel.",
    [
      "TW testers liked maneuverability and accuracy",
      "Stable, connected impact in their playtest",
    ],
    [
      "Less plow-through than the outgoing model",
      "An endorsement does not establish Medvedev's match specifications",
    ],
    ["control", "handling"],
    librarySources.tfight,
    "TW found faster handling, dependable control and less plow-through power than its predecessor.",
    "Compare defensive blocks with full attacking swings. Does the quicker swing compensate for the missing heft?",
  ),
  "yonex-ezone-98-2025": brief(
    "A power-oriented 98, with evidence still to build.",
    "Intermediate to advanced players curious about power and comfort in a 98.",
    [
      "Yonex positions it for power and comfort",
      "305 g unstrung with a 16x19 pattern",
    ],
    [
      "Manufacturer positioning is not an independent comfort finding",
      "A pro listing does not establish your ideal weight or strings",
    ],
    ["power"],
    librarySources.ezone,
    "Yonex supplies stock specifications and intended positioning. Our old-to-new comparison has a separate retailer playtest.",
    "Demo against a control-oriented 98 using the same strings. Track depth and comfort through a full session.",
    true,
  ),
  "asics-court-ff-3": brief(
    "Wrapped support rather than an airy slipper.",
    "Players prioritizing containment and stable hard-court stops.",
    [
      "Retailer testers liked support and hard-court traction",
      "Durable protection in their playtest",
    ],
    [
      "The close wrap needs a try-on",
      "A substantial shoe rather than the lightest option",
    ],
    ["support", "durability"],
    librarySources.court,
    "The men's hard-court playtest found strong support and traction. Individual testers differed on fit and feel.",
    "Try putting them on, then check instep pressure and heel hold during lateral stops with your match socks.",
  ),
  "asics-solution-speed-ff-4-womens": brief(
    "Light-feeling cushioning. Check the length.",
    "Players seeking agile movement and cushioning in the women's hard-court line.",
    [
      "Testers liked cushioning and traction",
      "Light-feeling movement without break-in for the team",
    ],
    [
      "The team went up half a size from their usual fit",
      "A wide-footed tester still felt pressure near the toes",
    ],
    ["cushioning", "handling"],
    librarySources.speedWomen,
    "TW's women's team liked cushioning and movement after adjusting length. Their sizing experience is not a guarantee for every foot.",
    "Compare your normal size with the next half size. Check toe pressure and heel movement after warming up.",
  ),
  "asics-gel-resolution-x-womens": brief(
    "Support and wear resistance, with more shoe around you.",
    "Players seeking a substantial women's hard-court stability option.",
    [
      "The women's playtest emphasizes stability",
      "Wear resistance was a strength",
    ],
    [
      "Testers needed significant break-in; do not tolerate persistent pain",
      "Standard width is not the wide variant",
    ],
    ["support", "durability"],
    librarySources.resWomen,
    "TW's women's playtest reports strong support and durability. Those observations do not establish the fit of the separate wide version.",
    "Compare lateral stops and repeated accelerations against your current pair. Check whether the support is worth the extra bulk.",
  ),
  "asics-solution-speed-ff-4-clay-womens": brief(
    "A clay option with manufacturer-only evidence so far.",
    "Players seeking the women's clay-specific FF 4 listing to try in person.",
    [
      "A separately specified clay outsole",
      "Part of ASICS' speed-focused line",
    ],
    [
      "No clay playtest is summarized here",
      "Hard-court fit and wear findings cannot establish clay grip or durability",
    ],
    ["handling"],
    librarySources.clayWomen,
    "ASICS identifies this as the women's clay model. Performance on your court remains untested in our evidence.",
    "Confirm the exact clay outsole and return policy, then check release and stopping on your regular clay court.",
    true,
  ),
};
