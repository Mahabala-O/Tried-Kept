import { COLORS, hashSeed, paletteFor } from "./palette";

export type RacquetArtProps = {
  seed?: string | number;
  frame?: string;
  accent?: string;
  grip?: string;
  strings?: string;
  /** Tilt in degrees. Defaults to a slight lean that varies by seed. */
  tilt?: number;
  className?: string;
  title?: string;
};

const INK = COLORS.ink;
const CX = 80;
const CY = 92;

/** Head shapes as inner radii: classic oval, rounder, longer teardrop. */
const HEADS = [
  { rx: 48, ry: 66 },
  { rx: 52, ry: 62 },
  { rx: 45, ry: 69 },
] as const;

function stringLines(rx: number, ry: number, gap: number) {
  const lines: string[] = [];
  const mains = Math.floor(rx / gap);
  for (let k = -mains; k <= mains; k++) {
    const x = CX + k * gap;
    const half = ry * Math.sqrt(Math.max(0, 1 - ((x - CX) / rx) ** 2));
    lines.push(`M${x.toFixed(1)} ${(CY - half).toFixed(1)} V${(CY + half).toFixed(1)}`);
  }
  const crosses = Math.floor(ry / 10);
  for (let k = -crosses; k <= crosses; k++) {
    const y = CY + k * 10;
    const half = rx * Math.sqrt(Math.max(0, 1 - ((y - CY) / ry) ** 2));
    lines.push(`M${(CX - half).toFixed(1)} ${y} H${(CX + half).toFixed(1)}`);
  }
  return lines.join(" ");
}

/** A stylized tennis racquet. Original art with no brand marks or string stencils. */
export default function RacquetArt({ seed = "racquet", tilt, className, title, ...colors }: RacquetArtProps) {
  const hash = hashSeed(seed);
  const base = paletteFor(seed);
  const frame = colors.frame ?? base.main;
  const accent = colors.accent ?? base.accent;
  const grip = colors.grip ?? base.detail;
  const strings = colors.strings ?? (frame === COLORS.ink ? COLORS.optic : INK);
  const lean = tilt ?? -18 + ((hash >>> 5) % 12);
  const { rx: RX, ry: RY } = HEADS[(hash >>> 9) % HEADS.length];
  const beam = ((hash >>> 11) & 1) === 0 ? 12 : 16;
  const strings2 = stringLines(RX, RY, ((hash >>> 12) & 1) === 0 ? 8.5 : 7.5);
  const twoTone = ((hash >>> 13) & 1) === 0;
  const solidThroat = ((hash >>> 14) & 1) === 0;

  return (
    <svg
      viewBox="-20 -14 200 304"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g transform={`rotate(${lean} 80 140)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        {/* Throat */}
        <path d="M52 150 L72 212 L88 212 L108 150 Q80 168 52 150 Z" fill={frame} />
        {!solidThroat && <path d="M66 162 Q80 168 94 162 L84 196 L76 196 Z" fill={COLORS.paper} strokeWidth={2.5} />}
        {solidThroat && <path d="M60 160 Q80 172 100 160" fill="none" stroke={accent} strokeWidth={5} />}
        {/* Head */}
        <ellipse cx={CX} cy={CY} rx={RX + beam} ry={RY + beam} fill={frame} />
        {/* Two-tone frame: the top half of the hoop in the accent color */}
        {twoTone && (
          <path
            d={`M${CX - RX - beam} ${CY} A${RX + beam} ${RY + beam} 0 0 1 ${CX + RX + beam} ${CY} L${CX + RX} ${CY} A${RX} ${RY} 0 0 0 ${CX - RX} ${CY} Z`}
            fill={accent}
          />
        )}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={COLORS.paper} strokeWidth={2.5} />
        <path d={strings2} stroke={strings} strokeWidth={1.4} strokeLinecap="butt" fill="none" opacity={0.75} />
        {/* Bumper and side accents */}
        <path d={`M${CX - 26} ${CY - RY - 8} Q${CX} ${CY - RY - 16} ${CX + 26} ${CY - RY - 8}`} fill="none" stroke={accent} strokeWidth={7} />
        {!twoTone && <path d={`M${CX - RX - beam / 2} ${CY - 10} L${CX - RX - beam / 2} ${CY + 14}`} stroke={accent} strokeWidth={6} />}
        {!twoTone && <path d={`M${CX + RX + beam / 2} ${CY - 10} L${CX + RX + beam / 2} ${CY + 14}`} stroke={accent} strokeWidth={6} />}
        {/* Handle with grip wrap */}
        <rect x={68} y={208} width={24} height={62} rx={6} fill={grip} />
        <g strokeWidth={2} opacity={0.55}>
          {[220, 232, 244, 256].map((y) => (
            <path key={y} d={`M69 ${y + 4} L91 ${y - 4}`} />
          ))}
        </g>
        <rect x={65} y={264} width={30} height={12} rx={5} fill={INK} />
      </g>
    </svg>
  );
}
