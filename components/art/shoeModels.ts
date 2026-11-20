/**
 * Drawing specs for each catalog shoe. Each one is drawn from the real model's
 * side view: collar height, sole thickness, heel and midsole build, side
 * construction and a colorway close to one the model is sold in. No logos,
 * brand stripes or other marks, so the art evokes the shoe without copying its
 * trademarks. Keyed by product slug from lib/catalog.ts.
 */

export type ShoeCollar = "low" | "mid" | "high" | "sock";
export type ShoeHeel = "none" | "panel" | "cage" | "block" | "window";
export type ShoeSide = "none" | "dash" | "ribs" | "saddle" | "mesh" | "wedge" | "bar";
export type ShoeTread = "herringbone" | "clay" | "studs";

export type ShoeColors = {
  /** Main upper. */
  upper: string;
  /** Heel, collar lining and other secondary upper panels. */
  upper2: string;
  /** Side graphic: dash, ribs, saddle, wedge or bar. */
  graphic: string;
  midsole: string;
  /** Color sweep or stripe on the midsole. */
  midsole2: string;
  outsole: string;
  lace: string;
  /** Tile background. */
  bg: string;
};

export type ShoeModel = {
  collar: ShoeCollar;
  /** Midsole height at the heel and toe, in viewBox units. About 12 is slim, 24 is chunky. */
  soleHeel: number;
  soleToe: number;
  heel: ShoeHeel;
  side: ShoeSide;
  /** Rubber guard wrapping the toe. */
  toeGuard: boolean;
  /** Trapezoid cutouts in the midsole, as on chunky stability shoes. */
  soleWindows: number;
  /** A visible cushioning pod under the midfoot. */
  airPod: boolean;
  /** A colored sweep across the forefoot of the midsole. */
  soleSweep: boolean;
  /** A thin colored line along the midsole. */
  soleStripe: boolean;
  /** A pull loop at the back of the collar. */
  heelLoop: boolean;
  tread: ShoeTread;
  colors: ShoeColors;
};

const INK = "#0E2A2A";

const base: Omit<ShoeModel, "colors"> = {
  collar: "low",
  soleHeel: 16,
  soleToe: 10,
  heel: "none",
  side: "none",
  toeGuard: false,
  soleWindows: 0,
  airPod: false,
  soleSweep: false,
  soleStripe: false,
  heelLoop: false,
  tread: "herringbone",
};

export const SHOE_MODELS: Record<string, ShoeModel> = {
  // Slim, low and pointed, with a darker heel and a long side dash. Shown in a mauve colorway.
  "nike-vapor-12": {
    ...base,
    soleHeel: 13,
    soleToe: 8,
    heel: "panel",
    side: "dash",
    toeGuard: true,
    colors: { upper: "#D8BFC3", upper2: "#3B3B3F", graphic: "#E9F4EE", midsole: "#F4F1EE", midsole2: "#3B3B3F", outsole: "#2A2A2E", lace: "#F4F1EE", bg: "#F6E9EB" },
  },
  // Flatter and plainer than the Vapor 12: an all-white upper with one black dash.
  "nike-vapor-pro-3": {
    ...base,
    soleHeel: 12,
    soleToe: 8,
    side: "dash",
    toeGuard: true,
    colors: { upper: "#FFFFFF", upper2: "#E6E8EA", graphic: "#111316", midsole: "#FFFFFF", midsole2: "#C9CDD2", outsole: "#E6E8EA", lace: "#FFFFFF", bg: "#DCE6FF" },
  },
  // The earlier Vapor Pro, close in shape to the Pro 3.
  "nike-vapor-pro-2": {
    ...base,
    soleHeel: 12,
    soleToe: 8,
    heel: "panel",
    side: "dash",
    colors: { upper: "#FFFFFF", upper2: "#2F6BFF", graphic: "#2F6BFF", midsole: "#FFFFFF", midsole2: "#2F6BFF", outsole: "#1D2B4F", lace: "#FFFFFF", bg: "#EEF3FF" },
  },
  // Chunky midsole with angular cutouts, a heel block and a volt line.
  "nike-gp-challenge-1-5": {
    ...base,
    soleHeel: 22,
    soleToe: 12,
    heel: "block",
    side: "wedge",
    toeGuard: true,
    soleWindows: 2,
    soleStripe: true,
    colors: { upper: "#F2F4F2", upper2: "#DADFDB", graphic: "#111316", midsole: "#FFFFFF", midsole2: "#D7F23A", outsole: "#D9DDDA", lace: "#FFFFFF", bg: "#EEF6D6" },
  },
  // Sock-like collar with a pull loop, and a visible pod under the midfoot.
  "nike-zoom-nxt": {
    ...base,
    collar: "sock",
    soleHeel: 18,
    soleToe: 11,
    side: "mesh",
    airPod: true,
    heelLoop: true,
    colors: { upper: "#FBFAFD", upper2: "#D9C6EC", graphic: "#C7B2E2", midsole: "#FFFFFF", midsole2: "#C6CCD4", outsole: "#E7E1EF", lace: "#FFFFFF", bg: "#F1EAFB" },
  },
  // Thick, stable build: a heel cage climbing the back, a big toe guard and a midfoot saddle.
  "asics-gel-resolution-9": {
    ...base,
    collar: "mid",
    soleHeel: 22,
    soleToe: 12,
    heel: "cage",
    side: "saddle",
    toeGuard: true,
    colors: { upper: "#FFFFFF", upper2: "#1C1C20", graphic: "#1C1C20", midsole: "#FFFFFF", midsole2: "#1C1C20", outsole: "#1C1C20", lace: "#FFFFFF", bg: "#E8ECEF" },
  },
  "asics-gel-resolution-x-wide-mens": {
    ...base,
    collar: "mid",
    soleHeel: 23,
    soleToe: 13,
    heel: "cage",
    side: "saddle",
    toeGuard: true,
    colors: { upper: "#FFFFFF", upper2: "#2E49C9", graphic: "#2E49C9", midsole: "#FFFFFF", midsole2: "#2E49C9", outsole: "#1D2F86", lace: "#FFFFFF", bg: "#DCE6FF" },
  },
  "asics-gel-resolution-x-wide-womens": {
    ...base,
    collar: "mid",
    soleHeel: 23,
    soleToe: 13,
    heel: "cage",
    side: "saddle",
    toeGuard: true,
    colors: { upper: "#FFFFFF", upper2: "#16897A", graphic: "#16897A", midsole: "#FFFFFF", midsole2: "#16897A", outsole: "#0F5C54", lace: "#FFFFFF", bg: "#D5F2E1" },
  },
  // Low and light: a white upper with a dark collar, a teal heel and a midfoot saddle.
  "asics-solution-speed-ff-4": {
    ...base,
    soleHeel: 14,
    soleToe: 9,
    heel: "panel",
    side: "saddle",
    colors: { upper: "#FFFFFF", upper2: "#1B2A4A", graphic: "#4A5878", midsole: "#FFFFFF", midsole2: "#2C8C7E", outsole: "#1B2A4A", lace: "#1B2A4A", bg: "#E3F1EE" },
  },
  // Deep blue knit upper, a light blue line along the sole and a dark collar.
  "mizuno-wave-exceed-tour-5": {
    ...base,
    soleHeel: 15,
    soleToe: 10,
    heel: "panel",
    side: "mesh",
    soleStripe: true,
    colors: { upper: "#1F4FA8", upper2: "#13245A", graphic: "#4C7DD6", midsole: "#1F4FA8", midsole2: "#7FC1F0", outsole: "#13245A", lace: "#1F4FA8", bg: "#DCEBFA" },
  },
  // Chunky heel, a lavender heel block, a midfoot saddle and a pastel sweep on the midsole.
  "yonex-eclipsion-5": {
    ...base,
    soleHeel: 22,
    soleToe: 12,
    heel: "panel",
    side: "saddle",
    soleSweep: true,
    colors: { upper: "#FFFFFF", upper2: "#7E86C7", graphic: "#B9BEE3", midsole: "#FFFFFF", midsole2: "#F3C1D2", outsole: "#A9DD7A", lace: "#FFFFFF", bg: "#ECEBFA" },
  },
  // Rows of thin diagonal ribs over a white and grey upper.
  "k-swiss-hypercourt-express-2": {
    ...base,
    soleHeel: 17,
    soleToe: 10,
    heel: "panel",
    side: "ribs",
    colors: { upper: "#F4F5F6", upper2: "#C9CDD1", graphic: "#3D4247", midsole: "#E1E4E7", midsole2: "#C9CDD1", outsole: "#B4B9BE", lace: "#FFFFFF", bg: "#EEF0F2" },
  },
  "k-swiss-hypercourt-express-3": {
    ...base,
    soleHeel: 15,
    soleToe: 9,
    side: "ribs",
    colors: { upper: "#17191C", upper2: "#2A2D31", graphic: "#E9ECEF", midsole: "#FFFFFF", midsole2: "#E9ECEF", outsole: "#17191C", lace: "#17191C", bg: "#E4E7EA" },
  },
  // Mid-cut collar, a triangular heel window and a dark lower midsole.
  "new-balance-coco-cg2": {
    ...base,
    collar: "high",
    soleHeel: 21,
    soleToe: 12,
    heel: "window",
    side: "mesh",
    soleSweep: true,
    colors: { upper: "#D6EBC9", upper2: "#BFDDAE", graphic: "#A8CF95", midsole: "#D6EBC9", midsole2: "#1E5A57", outsole: "#E0B864", lace: "#D6EBC9", bg: "#EAF5E1" },
  },
  // Cream upper, a dark bar low across the heel and midfoot.
  "on-the-roger-pro-fire": {
    ...base,
    soleHeel: 19,
    soleToe: 11,
    heel: "panel",
    side: "bar",
    colors: { upper: "#EFE8D8", upper2: "#2A2622", graphic: "#2A2622", midsole: "#EFE8D8", midsole2: "#2A2622", outsole: "#E2D9C4", lace: "#C7BCA6", bg: "#F6F0E2" },
  },
  // Black upper, a grey collar and a hot pink sweep on a white clay sole.
  "on-the-roger-pro-3-clay": {
    ...base,
    soleHeel: 18,
    soleToe: 11,
    heel: "panel",
    side: "bar",
    soleSweep: true,
    tread: "clay",
    colors: { upper: "#1A1A1D", upper2: "#6C6E73", graphic: "#FFFFFF", midsole: "#FFFFFF", midsole2: "#F0287D", outsole: "#FFFFFF", lace: "#1A1A1D", bg: "#FCE3EE" },
  },
};
// Separate retail listings share the original illustration's silhouette; these
// drawings are labeled as illustrations and are not measurements of the shoe.
SHOE_MODELS["asics-solution-speed-ff-4-womens"] = SHOE_MODELS["asics-solution-speed-ff-4"];
SHOE_MODELS["asics-solution-speed-ff-4-clay-womens"] = { ...SHOE_MODELS["asics-solution-speed-ff-4"], tread: "clay" };
SHOE_MODELS["asics-gel-resolution-x-womens"] = SHOE_MODELS["asics-gel-resolution-x-wide-womens"];
SHOE_MODELS["asics-court-ff-3"] = { ...base, collar: "sock", heel: "cage", side: "ribs", toeGuard: true, soleHeel: 18, soleToe: 12, colors: { upper: "#F8FAFA", upper2: "#D9E1E8", graphic: "#1C4460", midsole: "#FFFFFF", midsole2: "#B6D342", outsole: "#293E48", lace: "#FFFFFF", bg: "#E7F0E6" } };


const SIDES: ShoeSide[] = ["dash", "ribs", "saddle", "mesh", "wedge", "bar"];
const HEELS: ShoeHeel[] = ["none", "panel", "cage", "block", "window"];
const COLLARS: ShoeCollar[] = ["low", "low", "mid", "high", "sock"];

/** A made-up shoe for decorative spots, varied by a hash. Not tied to any real model. */
export function genericShoe(
  hash: number,
  colors: { main: string; accent: string; detail: string; base: string; lace: string; bg: string },
  variant?: number,
): ShoeModel {
  const chunky = ((hash >>> 3) & 1) === 0;
  return {
    collar: COLLARS[(hash >>> 6) % COLLARS.length],
    soleHeel: chunky ? 21 : 14,
    soleToe: chunky ? 12 : 9,
    heel: HEELS[(hash >>> 9) % HEELS.length],
    side: SIDES[(variant ?? hash >>> 12) % SIDES.length],
    toeGuard: ((hash >>> 15) & 1) === 0,
    soleWindows: chunky && ((hash >>> 16) & 1) === 0 ? 2 : 0,
    airPod: !chunky && ((hash >>> 17) & 1) === 0,
    soleSweep: ((hash >>> 18) & 1) === 0,
    soleStripe: ((hash >>> 19) & 1) === 0,
    heelLoop: ((hash >>> 20) & 1) === 0,
    tread: (["herringbone", "clay", "studs"] as const)[(hash >>> 21) % 3],
    colors: {
      upper: colors.main,
      upper2: colors.accent,
      graphic: colors.detail,
      midsole: colors.base,
      midsole2: colors.accent,
      outsole: INK,
      lace: colors.lace,
      bg: colors.bg,
    },
  };
}
