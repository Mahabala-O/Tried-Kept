/** Court Pop colors as plain hex, so art renders the same anywhere an SVG goes. */
export const COLORS = {
  cream: "#FFF7E6",
  creamDeep: "#FCEBC8",
  paper: "#FFFFFF",
  ink: "#0E2A2A",
  optic: "#E6FF3D",
  clay: "#FF6A3D",
  clayDeep: "#C8461E",
  claySoft: "#FFE1D4",
  hardcourt: "#2F6BFF",
  hardcourtSoft: "#DCE6FF",
  grass: "#17A35B",
  grassDeep: "#0F7A43",
  grassSoft: "#D5F2E1",
} as const;

export type GearColors = {
  /** Main body: the shoe upper or the racquet frame. */
  main: string;
  /** Toe cap and heel, or the frame's bumper and throat. */
  accent: string;
  /** Side pattern, or the grip. */
  detail: string;
  /** Midsole, or the string bed. */
  base: string;
  /** Laces, or the strings. */
  lace: string;
  /** Tile background behind the art. */
  bg: string;
};

const C = COLORS;

export const GEAR_PALETTES: GearColors[] = [
  { main: C.paper, accent: C.clay, detail: C.hardcourt, base: C.optic, lace: C.ink, bg: C.hardcourtSoft },
  { main: C.optic, accent: C.ink, detail: C.clay, base: C.paper, lace: C.paper, bg: C.claySoft },
  { main: C.hardcourt, accent: C.optic, detail: C.paper, base: C.paper, lace: C.optic, bg: C.cream },
  { main: C.clay, accent: C.paper, detail: C.ink, base: C.cream, lace: C.paper, bg: C.grassSoft },
  { main: C.grass, accent: C.optic, detail: C.paper, base: C.paper, lace: C.ink, bg: C.creamDeep },
  { main: C.paper, accent: C.ink, detail: C.grass, base: C.clay, lace: C.ink, bg: C.optic },
  { main: C.ink, accent: C.clay, detail: C.optic, base: C.paper, lace: C.optic, bg: C.hardcourtSoft },
];

/** FNV-1a, so the same slug always gets the same look. */
export function hashSeed(seed: string | number): number {
  const text = String(seed);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function paletteFor(seed: string | number): GearColors {
  return GEAR_PALETTES[hashSeed(seed) % GEAR_PALETTES.length];
}
