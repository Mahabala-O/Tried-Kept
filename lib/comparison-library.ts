import type { Comparison } from "./catalog";
import {
  expandedBriefs,
  librarySources,
  racquetFacts,
} from "./catalog-expansion";

const framePairs = [
  [
    "aero-98-gen9-vs-vcore-98-2026",
    "Pure Aero 98 Gen9 vs VCORE 98 (2026)",
    "Two spin-focused 98s. Which launch and depth can you control?",
    "babolat-pure-aero-98-gen9",
    "yonex-vcore-98-2026",
    "Both are spin candidates. Test the Aero's more controlled positioning against the VCORE's livelier depth; this is an editorial comparison of separate playtests, not a matched head-to-head experiment.",
  ],
  [
    "speed-mp-2026-vs-gravity-mp-2025",
    "Speed MP (2026) vs Gravity MP (2025)",
    "More available pace or a feel-first response?",
    "head-speed-mp-2026",
    "head-gravity-mp-2025",
    "Investigate Speed for a more powerful, solid response and Gravity for feel and control. The lower static mass of the Gravity does not by itself establish easier handling. Compare defensive depth and late-session timing.",
  ],
  [
    "tfight-305s-vs-blade-98-v10",
    "TFight 305S vs Blade 98 16x19 v10",
    "Two control-oriented 98s. Which is easier to time?",
    "tecnifibre-tfight-305s",
    "wilson-blade-98-16x19-v10",
    "The TFight playtest emphasizes quicker handling; the Blade test emphasizes feel and stability. Use matched strings and a full session to decide which tradeoff helps you. The mass values below use different measurement bases.",
  ],
  [
    "pure-drive-2025-vs-clash-100-v3",
    "Pure Drive (2025) vs Clash 100 v3",
    "Easy depth: firm response or flexible feel?",
    "babolat-pure-drive-2025",
    "wilson-clash-100-v3",
    "Investigate the Pure Drive for pace and spin, watching control and firm feel. Try the Clash for easier movement and a softer-feeling response, checking stability against heavier shots.",
  ],
  [
    "ezone-98-2025-vs-aero-98-gen9",
    "EZONE 98 (2025) vs Pure Aero 98 Gen9",
    "Power-oriented or spin-oriented: which 98 suits your swing?",
    "yonex-ezone-98-2025",
    "babolat-pure-aero-98-gen9",
    "Yonex positions the EZONE around power and comfort; the Aero playtest emphasizes spin and precision. Evidence depth differs here: manufacturer positioning is not equivalent to an independent playtest. Demo before treating either as your keeper.",
  ],
] as const;

export const expandedComparisons: Comparison[] = framePairs.map(
  ([slug, title, question, left, right, takeaway]) => {
    const ids = [left, right];
    const facts = ids.map((id) => racquetFacts[id]);
    return {
      slug,
      title,
      question,
      productSlugs: ids,
      takeaway,
      rows: [
        {
          label: "Head size",
          values: facts.map((f) => `${f.head} in²`),
          valueSources: facts.map((f) => f.source),
        },
        {
          label: "Mass · check the basis",
          values: facts.map(
            (f) => `${f.mass} g · ${f.massBasis.toLowerCase()}`,
          ),
          valueSources: facts.map((f) => f.source),
        },
        {
          label: "String pattern",
          values: facts.map((f) => f.pattern),
          valueSources: facts.map((f) => f.source),
        },
      ],
      firsthand: [],
      gap: "No matched-string head-to-head test is recorded. String type, tension, sample variation and your swing can change the result.",
      sources: [
        ...new Map(
          ids
            .flatMap((id) => [
              racquetFacts[id].source,
              ...expandedBriefs[id].evidence.map((e) => e.source),
            ])
            .map((s) => [s.url, s]),
        ).values(),
      ],
    };
  },
);
expandedComparisons.push({
  slug: "resolution-x-vs-solution-speed-ff4-womens",
  title: "GEL-Resolution X vs Solution Speed FF 4 (women's)",
  question: "Substantial support or lighter-feeling movement?",
  productSlugs: [
    "asics-gel-resolution-x-womens",
    "asics-solution-speed-ff-4-womens",
  ],
  takeaway:
    "The separate women's playtests point toward Resolution X for stability and wear resistance, with significant break-in. FF 4 testers liked cushioning and agility after adjusting size. Try both on; those are different teams' experiences, not a fit prediction.",
  rows: [
    {
      label: "Version reviewed",
      values: ["Women's · hard court · standard width", "Women's · hard court"],
      valueSources: [librarySources.resWomen, librarySources.speedWomen],
    },
  ],
  firsthand: [],
  gap: "No same-size lab width comparison is recorded. Men's measurements are not substituted for the women's shoes.",
  sources: [librarySources.resWomen, librarySources.speedWomen],
});
