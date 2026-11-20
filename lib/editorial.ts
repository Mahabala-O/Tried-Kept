import type { Source } from "./catalog";
import { expandedBriefs } from "./catalog-expansion";
import { apparelBriefs } from "./apparel";

export const EDITORIAL_CHECKED = "2026-11-19";
export type EvidenceKind =
  | "Manufacturer specification"
  | "Player interview"
  | "Brand announcement"
  | "Retailer playtest"
  | "Independent lab"
  | "Forum anecdote";
export type Evidence = { kind: EvidenceKind; summary: string; source: Source };
export type GearPriority = "room" | "support" | "cushioning" | "durability" | "power" | "spin" | "control" | "handling";
export type GearBrief = {
  verdict: string;
  suits: string;
  strengths: string[];
  cautions: string[];
  priorities: GearPriority[];
  evidence: Evidence[];
  tryThis: string;
};
const source = (label: string, url: string): Source => ({ label, url });
export const reviewSources = {
  vapor12: source(
    "RunRepeat · Vapor 12 lab test",
    "https://runrepeat.com/nike-vapor-12",
  ),
  pro3: source(
    "RunRepeat · Vapor Pro 3 lab test",
    "https://runrepeat.com/nike-vapor-pro-3",
  ),
  res9: source(
    "RunRepeat · GEL-Resolution 9 lab test",
    "https://runrepeat.com/asics-gel-resolution-9",
  ),
  speed4: source(
    "RunRepeat · Solution Speed FF 4 lab test",
    "https://runrepeat.com/asics-solution-speed-ff-4",
  ),
  speedStore: source(
    "Tennis Warehouse · men's Solution Speed FF 4 playtest",
    "https://www.tennis-warehouse.com/Learning_Center/shoe_reviews/asics_solution_speed_ff_4_mens.html",
  ),
  speedShop: source(
    "ASICS U.S. · men's Solution Speed FF 4, 1041A532-100",
    "https://www.asics.com/us/en-us/solution-speed-ff-4/p/ANA_1041A532-100.html",
  ),
  speedForum: source(
    "r/10s · FF 4 sizing experiences",
    "https://www.reddit.com/r/10s/comments/1tibazg/solution_speed_ff4_sizing_expirience/",
  ),
  proForum: source(
    "r/10s · Vapor Pro 3 owner experiences",
    "https://www.reddit.com/r/10s/comments/1r9wzhq/nike_vapor_pro_3_any_experiences/",
  ),
  coco: source(
    "Tennis Warehouse · women's Coco CG2 playtest",
    "https://www.tennis-warehouse.com/learning_center/shoe_reviews/new_balance_coco_cg2.html",
  ),
  cocoLab: source(
    "RunRepeat · Coco CG2 lab test",
    "https://runrepeat.com/new-balance-coco-cg2",
  ),
  hyper3: source(
    "Tennis Warehouse · men's Hypercourt Express 3 playtest",
    "https://www.tennis-warehouse.com/learning_center/shoe_reviews/kswiss_hypercourt_express_3_mens.html",
  ),
  eclipsion: source(
    "Tennis Warehouse · men's Eclipsion 5 playtest",
    "https://www.tennis-warehouse.com/learning_center/shoe_reviews/yonex_eclipsion_5_men.html",
  ),
  resForum: source(
    "r/10s · replacing the GEL-Resolution 9",
    "https://www.reddit.com/r/10s/comments/1th2hlm/best_asics_gel_resolution_9_alternatives_in_2026/",
  ),
};

/** Edited summaries, not scraped reviews or a claim of community consensus. */
export const gearBriefs: Record<string, GearBrief> = {
  ...apparelBriefs,
  ...expandedBriefs,
  "nike-vapor-12": {
    verdict: "A secure, planted ride if you prefer a close fit.",
    suits:
      "Players prioritizing lateral support and court connection over a roomy fit.",
    strengths: [
      "Stable on changes of direction",
      "Durable construction and secure fit",
    ],
    cautions: [
      "Narrower forefoot than the Vapor Pro 3 in the lab's test shoe",
      "Heavier than the lab average; ventilation is a compromise",
    ],
    priorities: ["support", "durability"],
    evidence: [
      {
        kind: "Independent lab",
        source: reviewSources.vapor12,
        summary:
          "RunRepeat liked the stable platform and durability. Its cautions include weight, limited airflow and fit for wide feet.",
      },
    ],
    tryThis:
      "Check toe space after warming up, then try lateral stops. A pro wearing it does not establish that it fits your foot.",
  },
  "nike-vapor-pro-3": {
    verdict:
      "A balanced alternative with more measured forefoot room than the Vapor 12.",
    suits:
      "Players wanting support and a less close-fitting forefoot, with forefoot Air Zoom.",
    strengths: [
      "Secure midfoot and lateral support",
      "Strong durability in the lab test",
    ],
    cautions: [
      "Extra measured width is not a dedicated wide size",
      "Lab testers found less propulsion than the previous model and limited ventilation",
    ],
    priorities: ["room", "support", "durability"],
    evidence: [
      {
        kind: "Independent lab",
        source: reviewSources.pro3,
        summary:
          "RunRepeat praised support and wear resistance, but found the smaller Air Zoom unit less propulsive than before.",
      },
      {
        kind: "Forum anecdote",
        source: reviewSources.proForum,
        summary:
          "Owners disagree: one liked the wide-foot comfort after one use, while others disliked the high heel collar or toe flex. Another preferred the Pro 2 but kept using the 3. These are individual experiences, not a fit guarantee.",
      },
    ],
    tryThis:
      "Compare heel-collar contact and toe flex with your old pair. Try the same socks and both feet before deciding on size.",
  },
  "asics-gel-resolution-9": {
    verdict: "Support and wear resistance, with some weight and break-in.",
    suits:
      "Players who value a secure, durable shoe and do not mind a substantial feel.",
    strengths: [
      "Secure foot containment in the lab test",
      "Durable outsole and toe protection",
    ],
    cautions: [
      "Tapered toe area despite medium forefoot width",
      "Some break-in; heavier than the lab average",
    ],
    priorities: ["support", "durability"],
    evidence: [
      {
        kind: "Independent lab",
        source: reviewSources.res9,
        summary:
          "RunRepeat measured 93.8 mm at the ball of the foot but 66.6 mm near the big toe: forefoot width alone misses the taper.",
      },
    ],
    tryThis:
      "Use your current pair as the baseline. Compare the toe taper and heel hold, not just the number on the size label.",
  },
  "asics-solution-speed-ff-4": {
    verdict: "Fast movement with more cushioning; fit needs a careful trial.",
    suits:
      "Players seeking a lighter-feeling alternative to a substantial stability shoe.",
    strengths: [
      "Retailer testers liked the comfort and stability for its weight",
      "Lab-tested grip and a softer midsole",
    ],
    cautions: [
      "Wide at the ball of the foot, but shallow and tapered at the toes",
      "Lab airflow results were poor; retailer testers had mixed heat experiences",
    ],
    priorities: ["room", "cushioning", "handling"],
    evidence: [
      {
        kind: "Independent lab",
        source: reviewSources.speed4,
        summary:
          "RunRepeat measured 337 g and 97.5 mm forefoot width in its test shoe. Its 20.6 mm toe height and low breathability result complicate the roomy-fit story.",
      },
      {
        kind: "Retailer playtest",
        source: reviewSources.speedStore,
        summary:
          "Tennis Warehouse's men's team liked the support and cushioning. Fit varied: a narrow-footed tester stayed at his usual size, while another needed a larger pair.",
      },
      {
        kind: "Forum anecdote",
        source: reviewSources.speedForum,
        summary:
          "One owner found their usual size too small, sold it, and later reported comfort half a size up. Another still found a half-size increase small. This does not support a universal sizing rule.",
      },
    ],
    tryThis:
      "Check space above your toes and heel hold together. More forefoot width does not make this a dedicated wide shoe.",
  },
  "new-balance-coco-cg2": {
    verdict: "Supportive and substantial, with grip that divided testers.",
    suits:
      "Players who enjoy a mid-cut shoe and prioritize support over a minimal feel.",
    strengths: [
      "Retailer testers liked the support, cushioning and durability",
      "Distinctive mid-cut shape",
    ],
    cautions: [
      "Bulky and heavy-feeling for some testers",
      "Two testers found the traction too sticky during lateral movement",
    ],
    priorities: ["support", "cushioning", "durability"],
    evidence: [
      {
        kind: "Retailer playtest",
        source: reviewSources.coco,
        summary:
          "Tennis Warehouse's women's team praised stability but disagreed on traction. A shoe can grip well and still feel restrictive for a particular movement style.",
      },
    ],
    tryThis:
      "Try controlled direction changes on a suitable court. Decide whether the ankle height and grip let you move naturally.",
  },
  "k-swiss-hypercourt-express-3": {
    verdict: "Comfort and forefoot space, with a larger-feeling chassis.",
    suits:
      "Players who prioritize cushioning and an accommodating feel over a minimal speed shoe.",
    strengths: [
      "Retailer testers liked the underfoot comfort",
      "Good stability and wear resistance in the men's playtest",
    ],
    cautions: [
      "Sizing varied significantly between testers",
      "Some found it warm, bulky or occasionally too grippy",
    ],
    priorities: ["room", "cushioning", "durability"],
    evidence: [
      {
        kind: "Retailer playtest",
        source: reviewSources.hyper3,
        summary:
          "Tennis Warehouse found a comfortable, durable update. One tester's oversized fit caused internal movement; other testers liked the roomy forefoot. Fit changes the outcome.",
      },
    ],
    tryThis:
      "Check whether your heel stays secure when the forefoot has enough room. Avoid choosing solely for step-in softness.",
  },
  "yonex-eclipsion-5": {
    verdict: "A substantial option for support and outsole wear.",
    suits:
      "Players looking for a durable, stable shoe rather than a lightweight speed model.",
    strengths: [
      "Retailer testers praised support and durability",
      "Cushioned ride in the men's playtest",
    ],
    cautions: [
      "Bulk was the main retailer criticism",
      "One narrow-footed tester had some movement inside the shoe",
    ],
    priorities: ["support", "durability"],
    evidence: [
      {
        kind: "Retailer playtest",
        source: reviewSources.eclipsion,
        summary:
          "Tennis Warehouse's men's testers liked the cushioning and long-lasting outsole, with bulk and fit tradeoffs.",
      },
      {
        kind: "Forum anecdote",
        source: reviewSources.resForum,
        summary:
          "One GEL-Resolution 9 wearer reported a successful switch to the Eclipsion 5, without enough fit detail to explain who else should follow.",
      },
    ],
    tryThis:
      "Compare lateral hold with your old pair. A single successful switch is a reason to try it, not proof of equivalent fit.",
  },
};

export type GearStory = {
  slug: string;
  proSlug: string;
  title: string;
  dek: string;
  publishedOn: string;
  before: string;
  after: string;
  productSlugs: string[];
  steps: { label: string; text: string; source: Source }[];
  lesson: string;
  limitation: string;
};
const igaSource = source(
  "Tennis.com · Swiatek on testing her custom shoe",
  "https://www.tennis.com/news/articles/iga-swiatek-says-on-is-really-really-close-to-creating-her-perfect-custom-shoe",
);
const benSource = source(
  "Tennis.com · Shelton explains his switch",
  "https://www.tennis.com/news/articles/ben-shelton-on-iga-swiatek-wait-custom-shoes-your-movement-is-biggest-weapon",
);
const cocoDesign = source(
  "Andscape · developing Gauff's second shoe",
  "https://andscape.com/features/coco-gauff-new-balance-coco-cg2-sneakers-release-info/",
);
const cocoLaunch = source(
  "New Balance · CG2 announcement, August 20, 2024",
  "https://newbalance.newsmarket.com/athlete-and-sports-news/new-balance-and-coco-gauff-announce-update-to-star-s-signature-shoe/s/1bb56bb1-8ddc-4e60-aedd-aa019459af4c",
);

/** Historical reporting. Never posed as a member review or the player's current kit. */
export const gearStories: GearStory[] = [
  {
    slug: "iga-swiatek-a-switch-worth-waiting-for",
    proSlug: "iga-swiatek",
    title: "A switch worth waiting for",
    dek: "Iga Swiatek kept her familiar shoes while a new prototype caught up with her movement.",
    publishedOn: "2023-08-14",
    before: "Familiar ASICS match shoes",
    after: "On prototype, still being tested",
    productSlugs: ["asics-gel-resolution-9"],
    steps: [
      {
        label: "The starting point",
        text: "After signing with On in March 2023, Swiatek continued competing in ASICS footwear through the clay and grass seasons.",
        source: igaSource,
      },
      {
        label: "What she tried",
        text: "She briefly practiced in an On prototype in Montreal, then returned to ASICS. She said the new design was close, but still needed changes for her movement and running style.",
        source: igaSource,
      },
      {
        label: "What worked, and what was unresolved",
        text: "Her familiar shoes remained the match choice. She wanted complete confidence before competing in the new pair. The report does not identify a specific defect in the prototype.",
        source: igaSource,
      },
    ],
    lesson:
      "Keep a trusted baseline and test changes before relying on them in a match.",
    limitation:
      "A 2023 prototype story, not a review of today's Roger Pro Fire or a claim that On shoes generally failed her.",
  },
  {
    slug: "ben-shelton-building-around-his-feet",
    proSlug: "ben-shelton",
    title: "Building around his feet",
    dek: "Ben Shelton's move to On was also a chance to find a shoe tailored to his needs.",
    publishedOn: "2023-08-31",
    before: "New Balance FuelCell 996 v4.5",
    after: "Customized On THE ROGER Pro",
    productSlugs: [],
    steps: [
      {
        label: "The starting point",
        text: "Tennis.com reported that Shelton changed from the FuelCell 996 v4.5 to a customized Roger Pro with his March 2023 On deal.",
        source: benSource,
      },
      {
        label: "What he wanted to change",
        text: "He said he had not yet found a shoe he loved or felt comfortable in, and knew the features he wanted. His comments describe his own needs, not a controlled comparison of the two retail models.",
        source: benSource,
      },
      {
        label: "What worked",
        text: "Shelton said working on a shoe that catered to those needs made it easy to find something he liked. He was competing in the customized pair at the 2023 US Open.",
        source: benSource,
      },
    ],
    lesson:
      "Describe the fit or movement problem first. A brand change alone is not an explanation.",
    limitation:
      "His 2023 customized shoe is not the retail Roger Pro 3 Clay in the dated bag. No head-to-head durability test was reported.",
  },
  {
    slug: "coco-gauff-feedback-shapes-the-cg2",
    proSlug: "coco-gauff",
    title: "The useful part of saying no",
    dek: "Coco Gauff and New Balance used critical feedback to shape her second signature shoe.",
    publishedOn: "2024-08-20",
    before: "Coco CG1 and development samples",
    after: "Coco CG2",
    productSlugs: ["new-balance-coco-cg2"],
    steps: [
      {
        label: "The starting point",
        text: "Andscape's interviews with New Balance describe CG2 discussions beginning in November 2022, soon after the CG1 launch. Gauff and her family considered three samples and discussed what they liked and disliked.",
        source: cocoDesign,
      },
      {
        label: "What changed",
        text: "New Balance announced the CG2 in August 2024 with a revised mid-cut silhouette, FuelCell cushioning and a carbon-fiber plate. Gauff described the collaborative design process positively.",
        source: cocoLaunch,
      },
      {
        label: "What we can and cannot conclude",
        text: "The brand's designers said Gauff had become more confident giving critical feedback. Neither source names one rejected sample's exact flaw or establishes that CG1 was a bad shoe.",
        source: cocoDesign,
      },
    ],
    lesson:
      "Record what you dislike as carefully as what you like. Useful feedback can improve the next choice.",
    limitation:
      "This combines a manufacturer announcement with reported design interviews. Retailer playtests of the CG2 are separate evidence below.",
  },
];
export const storiesForPro = (slug: string) =>
  gearStories.filter((story) => story.proSlug === slug);
export const storiesForProduct = (slug: string) =>
  gearStories.filter((story) => story.productSlugs.includes(slug));

export const proWardrobe: Record<
  string,
  { title: string; datedOn: string; text: string; source: Source }[]
> = {
  "coco-gauff": [
    {
      title: "New Balance × Miu Miu · 2025 tournament looks",
      datedOn: "2025-04-23",
      text: "The announced capsule paired navy, white and red for Rome; white, green and sky blue for Berlin; and white, royal blue and red for Cincinnati. Co-branded CG2 match shoes and coordinated warm-ups completed the looks. These custom editions are separate from the standard CG2 listing.",
      source: source(
        "Miu Miu · Coco Gauff collection",
        "https://www.miumiu.com/us/en/miumiu-club/special-projects/new-balance-x-miu-miu-with-coco-gauff.html",
      ),
    },
  ],
  "iga-swiatek": [
    {
      title: "On · professional court collection",
      datedOn: "2023-03-20",
      text: "On announced Swiatek for its professional on-court clothing collection and custom footwear development in March 2023. This records the partnership announcement, not an identification of a current dress or a retail SKU.",
      source: source(
        "On · Swiatek and Shelton announcement",
        "https://press.on-running.com/advantage-on-world-no1-and-3-time-grand-slam-champion-iga-swiatek-and-rising-star-ben-shelton-join-on-as-it-expands-its-presence-in-professional-tennis",
      ),
    },
  ],
  "ben-shelton": [
    {
      title: "On · professional court collection",
      datedOn: "2023-03-20",
      text: "On's March 2023 announcement named Shelton for its professional on-court collection. An apparel partnership does not identify every shirt, short or accessory he has worn since.",
      source: source(
        "On · Swiatek and Shelton announcement",
        "https://press.on-running.com/advantage-on-world-no1-and-3-time-grand-slam-champion-iga-swiatek-and-rising-star-ben-shelton-join-on-as-it-expands-its-presence-in-professional-tennis",
      ),
    },
  ],
};
