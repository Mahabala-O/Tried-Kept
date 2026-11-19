import { COLORS } from "./palette";

export type PlayerArtProps = {
  /** Background disc. Pass "none" for a transparent background. */
  bg?: string;
  /** Limbs and head. */
  figure?: string;
  shirt?: string;
  shorts?: string;
  shoes?: string;
  headband?: string;
  racquet?: string;
  ball?: string;
  /** Ground line color. */
  line?: string;
  /** Turns the swing and bounce on (they only run when motion is allowed). Defaults to true. */
  animated?: boolean;
  className?: string;
  title?: string;
};

const INK = COLORS.ink;

/** Draws a limb as an ink outline with a colored core, for a chunky cartoon look. */
function Limb({ d, color, width = 15 }: { d: string; color: string; width?: number }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={width + 6} fill="none" />
      <path d={d} stroke={color} strokeWidth={width} fill="none" />
    </>
  );
}

/** A playful player silhouette mid-swing, with a bouncing ball. Not any real person. */
export default function PlayerArt({
  bg = COLORS.hardcourt,
  figure = INK,
  shirt = COLORS.paper,
  shorts = COLORS.clay,
  shoes = COLORS.optic,
  headband = COLORS.clay,
  racquet = COLORS.optic,
  ball = COLORS.optic,
  line = COLORS.paper,
  animated = true,
  className,
  title,
}: PlayerArtProps) {
  const anim = (name: string) => (animated ? name : undefined);
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {bg !== "none" && <circle cx={160} cy={164} r={146} fill={bg} stroke={INK} strokeWidth={4} />}
      <path d="M28 292 H292" stroke={line} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      <ellipse cx={160} cy={296} rx={74} ry={7} fill={INK} opacity={0.25} />

      {/* Ball and its shadow */}
      <ellipse className={anim("pa-shadow")} cx={262} cy={293} rx={14} ry={4} fill={INK} opacity={0.35} />
      <g className={anim("pa-ball")}>
        <circle cx={262} cy={276} r={13} fill={ball} stroke={INK} strokeWidth={3} />
        <path d="M253 267 Q262 276 253 285 M271 267 Q262 276 271 285" stroke={COLORS.paper} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>

      <g className={anim("pa-body")} strokeLinecap="round" strokeLinejoin="round" style={{ transformOrigin: "160px 290px" }}>
        {/* Legs in a wide split step */}
        <Limb d="M150 196 L122 238 L96 280" color={figure} />
        <Limb d="M168 196 L206 232 L226 280" color={figure} />
        <path d="M78 281 Q80 271 96 273 L110 278 Q113 290 99 291 L81 291 Q73 289 78 281 Z" fill={shoes} stroke={INK} strokeWidth={3} />
        <path d="M212 281 Q214 271 230 273 L246 280 Q249 291 235 292 L216 292 Q208 289 212 281 Z" fill={shoes} stroke={INK} strokeWidth={3} />

        {/* Back arm out for balance */}
        <Limb d="M164 134 L128 148 L108 128" color={figure} width={13} />

        {/* Torso and shorts */}
        <path d="M158 192 L172 126" stroke={INK} strokeWidth={44} fill="none" />
        <path d="M158 192 L172 126" stroke={shirt} strokeWidth={38} fill="none" />
        <path d="M138 184 L180 184 L188 210 L161 214 L132 208 Z" fill={shorts} stroke={INK} strokeWidth={3} />

        {/* Head and headband */}
        <circle cx={183} cy={92} r={21} fill={figure} stroke={INK} strokeWidth={3} />
        <path d="M163 86 Q183 78 203 86" stroke={INK} strokeWidth={10} fill="none" />
        <path d="M163 86 Q183 78 203 86" stroke={headband} strokeWidth={6} fill="none" />
        <path d="M164 87 L148 97 M164 87 L150 80" stroke={headband} strokeWidth={5} fill="none" />

        {/* Racquet arm, swinging from the shoulder */}
        <g className={anim("pa-arm")} style={{ transformOrigin: "174px 128px" }}>
          <Limb d="M174 128 L212 142 L238 122" color={figure} width={13} />
          <path d="M238 122 L254 100" stroke={INK} strokeWidth={9} />
          <path d="M238 122 L254 100" stroke={racquet} strokeWidth={4} />
          <ellipse cx={269} cy={72} rx={20} ry={27} transform="rotate(30 269 72)" fill={COLORS.paper} stroke={INK} strokeWidth={9} />
          <ellipse cx={269} cy={72} rx={20} ry={27} transform="rotate(30 269 72)" fill="none" stroke={racquet} strokeWidth={4} />
          <g transform="rotate(30 269 72)" stroke={INK} strokeWidth={1.4} opacity={0.6}>
            <path d="M262 50 V94 M269 46 V98 M276 50 V94 M251 62 H287 M250 72 H288 M251 82 H287" />
          </g>
        </g>
      </g>
    </svg>
  );
}
