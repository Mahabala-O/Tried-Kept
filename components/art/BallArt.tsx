import { COLORS } from "./palette";

export type BallArtProps = {
  fill?: string;
  seam?: string;
  className?: string;
  /** Adds the bounce animation (it only runs when motion is allowed). */
  bounce?: boolean;
  title?: string;
};

/** A tennis ball with its seam curves. */
export default function BallArt({ fill = COLORS.optic, seam = COLORS.paper, className, bounce = false, title }: BallArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      overflow="visible"
    >
      <g className={bounce ? "anim-bounce" : undefined}>
        <circle cx={50} cy={50} r={44} fill={fill} stroke={COLORS.ink} strokeWidth={4} />
        <g fill="none" strokeLinecap="round">
          <path d="M20 19 Q46 50 20 81" stroke={COLORS.ink} strokeWidth={8} />
          <path d="M80 19 Q54 50 80 81" stroke={COLORS.ink} strokeWidth={8} />
          <path d="M20 19 Q46 50 20 81" stroke={seam} strokeWidth={4} />
          <path d="M80 19 Q54 50 80 81" stroke={seam} strokeWidth={4} />
        </g>
        <ellipse cx={36} cy={28} rx={8} ry={4.5} fill="#ffffff" opacity={0.55} transform="rotate(-30 36 28)" />
      </g>
    </svg>
  );
}
