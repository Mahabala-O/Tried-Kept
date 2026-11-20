import type { Source } from "./catalog";

export const SPONSORSHIP_CHECKED = "2026-11-19";
export type Sponsorship = {
  brand: string;
  scope: string;
  value: string;
  valueStatus: "reported" | "undisclosed";
  datedOn: string;
  term: string;
  fact: string;
  source: Source;
};
const on: Source = {
  label: "On · Świątek and Shelton partnership announcement",
  url: "https://press.on-running.com/advantage-on-world-no1-and-3-time-grand-slam-champion-iga-swiatek-and-rising-star-ben-shelton-join-on-as-it-expands-its-presence-in-professional-tennis",
};

/** Dated announcements and reporting, not a live endorsement ledger or signed contracts. */
export const sponsorships: Record<string, Sponsorship[]> = {
  "carlos-alcaraz": [
    {
      brand: "Nike",
      scope: "Apparel & footwear",
      value: "US$15–20 million per year",
      valueStatus: "reported",
      datedOn: "2024-06-13",
      term: "Multi-year extension reported in 2024",
      fact: "Relevo reported a new agreement and plans for a personal logo. The annual range is the outlet’s estimate, not a published Nike contract.",
      source: {
        label: "Relevo · Alcaraz’s reported Nike extension",
        url: "https://www.relevo.com/tenis/alcaraz-renueva-nike-contrato-superestrella-20240613103304-nt.html",
      },
    },
  ],
  "jannik-sinner": [
    {
      brand: "Nike",
      scope: "Apparel & footwear",
      value: "US$158 million over 10 years",
      valueStatus: "reported",
      datedOn: "2024-11-18",
      term: "10 years, as reported in 2024",
      fact: "Sports Business Journal, citing The Athletic, reported this total deal value. It is a historical reported contract figure, not annual earnings or the value of all his sponsors combined.",
      source: {
        label: "Sports Business Journal · Sinner’s commercial partnerships",
        url: "https://www.sportsbusinessjournal.com/Articles/2024/11/18/jannik-sinner-tennis-italy/",
      },
    },
  ],
  "iga-swiatek": [
    {
      brand: "On",
      scope: "Apparel & footwear",
      value: "Not disclosed in the announcement",
      valueStatus: "undisclosed",
      datedOn: "2023-03-20",
      term: "Duration not stated",
      fact: "On announced a professional on-court collection and individually developed THE ROGER Pro shoes. That custom development does not mean the retail shoe is identical.",
      source: on,
    },
  ],
  "ben-shelton": [
    {
      brand: "On",
      scope: "Apparel & footwear",
      value: "Not disclosed in the announcement",
      valueStatus: "undisclosed",
      datedOn: "2023-03-20",
      term: "Duration not stated",
      fact: "Shelton was announced as On’s first sponsored male tennis player. The release describes custom shoe development with the players, Roger Federer and On’s innovation team.",
      source: on,
    },
  ],
  "coco-gauff": [
    {
      brand: "New Balance",
      scope: "Apparel & footwear",
      value: "Not disclosed in the announcement",
      valueStatus: "undisclosed",
      datedOn: "2022-10-28",
      term: "Long-term extension; number of years not stated",
      fact: "New Balance’s extension announcement traces the relationship to 2018 and celebrated it with a new colorway of her signature Coco CG1. That announcement concerns the CG1, not the later CG2.",
      source: {
        label: "New Balance · Gauff’s long-term extension",
        url: "https://newbalance.newsmarket.com/athlete-and-sports-news/tennis/coco-gauff-signs-extension-contract-with-longtime-sponsor-new-balance/s/a58cb8e5-8e00-4965-be2f-bcff93636563",
      },
    },
  ],
  "novak-djokovic": [
    {
      brand: "Lacoste",
      scope: "Apparel ambassadorship",
      value: "Not disclosed in this source",
      valueStatus: "undisclosed",
      datedOn: "2025-08-25",
      term: "Duration not stated in the capsule announcement",
      fact: "Lacoste swapped its crocodile logo for a GOAT on a five-piece Djokovic capsule before the 2025 US Open: a polo, T-shirt, tracksuit jacket, cap and trousers.",
      source: {
        label: "Lacoste · Djokovic’s 2025 GOAT collection",
        url: "https://corporate.lacoste.com/lacoste-transforms-its-iconic-crocodile-into-a-goat-to-celebrate-novak-djokovic-with-an-exclusive-capsule-collection/",
      },
    },
  ],
};
