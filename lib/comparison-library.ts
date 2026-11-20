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
    "Try the Aero if you want to keep spin-heavy shots under control, and the VCORE if you want easier depth. This advice comes from separate reviews; the two racquets weren’t tested together. Try both to see which keeps your shots in.",
  ],
  [
    "speed-mp-2026-vs-gravity-mp-2025",
    "Speed MP (2026) vs Gravity MP (2025)",
    "More available pace or a feel-first response?",
    "head-speed-mp-2026",
    "head-gravity-mp-2025",
    "Try the Speed for power and a solid feel, or the Gravity for touch and control. The Gravity weighs less on the scale, but that alone doesn’t tell you how easy it is to swing. Compare how deep your defensive shots land and how each feels late in a set.",
  ],
  [
    "tfight-305s-vs-blade-98-v10",
    "TFight 305S vs Blade 98 16x19 v10",
    "Two control-oriented 98s. Which is easier to time?",
    "tecnifibre-tfight-305s",
    "wilson-blade-98-16x19-v10",
    "The TFight review highlights quick handling; the Blade review highlights feel and steadiness. Try both for a full session with the same strings and tension. Their listed weights were measured with and without strings, so check those labels before comparing the numbers.",
  ],
  [
    "pure-drive-2025-vs-clash-100-v3",
    "Pure Drive (2025) vs Clash 100 v3",
    "Easy depth: firm response or flexible feel?",
    "babolat-pure-drive-2025",
    "wilson-clash-100-v3",
    "Try the Pure Drive for pace and spin, checking whether its firm feel suits you and your shots stay in. Try the Clash for easier movement and a softer feel, checking whether it stays steady against hard hitters.",
  ],
  [
    "ezone-98-2025-vs-aero-98-gen9",
    "EZONE 98 (2025) vs Pure Aero 98 Gen9",
    "Power-oriented or spin-oriented: which 98 suits your swing?",
    "yonex-ezone-98-2025",
    "babolat-pure-aero-98-gen9",
    "Yonex describes the EZONE as a choice for power and comfort; the Aero review highlights spin and precision. Here we have brand information for the EZONE and on-court testing for the Aero. Try both before choosing which helps your game.",
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
          label: "Weight · with or without strings",
          values: facts.map(
            (f) =>
              `${f.mass} g · ${f.massBasis === "Unstrung" ? "without strings" : "with strings (reviewer’s measurement)"}`,
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
      gap: "We haven’t found a test of both racquets with the same strings and tension. Try them with your usual setup; individual racquets and swings can feel different.",
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
    "The women’s Resolution X testers liked its support and resistance to wear, but it took time to break in. FF 4 testers liked the cushioning and quick movement after adjusting their size. These were separate reviews, so try both on to check your own fit.",
  rows: [
    {
      label: "Version reviewed",
      values: ["Women's · hard court · standard width", "Women's · hard court"],
      valueSources: [librarySources.resWomen, librarySources.speedWomen],
    },
  ],
  firsthand: [],
  gap: "We don’t have width measurements of these women’s shoes in the same size. The men’s measurements can’t tell us how the women’s versions fit.",
  sources: [librarySources.resWomen, librarySources.speedWomen],
});
