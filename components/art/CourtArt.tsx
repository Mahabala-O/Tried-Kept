import { COLORS } from "./palette";

export type CourtVariant = "hard" | "clay" | "grass";

export type CourtArtProps = {
  variant?: CourtVariant;
  surface?: string;
  surround?: string;
  lines?: string;
  className?: string;
  title?: string;
};

const DEFAULTS: Record<CourtVariant, { surface: string; surround: string }> = {
  hard: { surface: COLORS.hardcourt, surround: COLORS.grass },
  clay: { surface: COLORS.clay, surround: COLORS.clayDeep },
  grass: { surface: COLORS.grass, surround: COLORS.grassDeep },
};

/** A court seen from above, with its lines. */
export default function CourtArt({ variant = "hard", surface, surround, lines = COLORS.paper, className, title }: CourtArtProps) {
  const colors = DEFAULTS[variant];
  const fill = surface ?? colors.surface;
  const outer = surround ?? colors.surround;
  return (
    <svg
      viewBox="0 0 360 200"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x={0} y={0} width={360} height={200} fill={outer} />
      <rect x={30} y={20} width={300} height={160} fill={fill} />
      {variant === "grass" &&
        [0, 1, 2, 3, 4].map((i) => <rect key={i} x={30 + i * 60} y={20} width={30} height={160} fill="#ffffff" opacity={0.08} />)}
      <g stroke={lines} strokeWidth={3} fill="none">
        <rect x={30} y={20} width={300} height={160} />
        <path d="M30 40 H330 M30 160 H330" />
        <path d="M105 40 V160 M255 40 V160" />
        <path d="M105 100 H255" />
        <path d="M30 100 H38 M322 100 H330" />
      </g>
      <path d="M180 10 V190" stroke={COLORS.ink} strokeWidth={4} strokeDasharray="6 4" />
      <circle cx={180} cy={10} r={5} fill={COLORS.ink} />
      <circle cx={180} cy={190} r={5} fill={COLORS.ink} />
    </svg>
  );
}
