import { COLORS, hashSeed, paletteFor, type GearColors } from "./palette";
import { SHOE_MODELS, genericShoe, type ShoeModel } from "./shoeModels";

export type ShoeArtProps = Partial<Omit<GearColors, "bg">> & {
  /** Any string or number. A catalog product slug draws that model; anything else gets a made-up shoe. */
  seed?: string | number;
  /** For made-up shoes, pick the side graphic directly. */
  variant?: number;
  /** Draw this spec instead of looking one up by seed. */
  model?: ShoeModel;
  className?: string;
  /** Accessible name. Without it the art is decorative and hidden from screen readers. */
  title?: string;
};

const INK = COLORS.ink;

/** Ground line and outsole thickness, in viewBox units. */
const G = 136;
const OUT = 6;
const COLLAR_TOP = { low: 50, mid: 44, high: 32, sock: 42 } as const;

/** The drawing spec for a seed: the catalog model when there is one, otherwise a made-up shoe. */
export function shoeModelFor(seed: string | number, colors: Partial<Omit<GearColors, "bg">> = {}, variant?: number): ShoeModel {
  const known = typeof seed === "string" ? SHOE_MODELS[seed] : undefined;
  if (known) return known;
  const p = { ...paletteFor(seed), ...stripUndefined(colors) };
  return genericShoe(hashSeed(seed), p, variant);
}

/** A side-view tennis shoe, toe to the right. Original art with no brand marks. */
export default function ShoeArt({ seed = "shoe", variant, model, className, title, ...colors }: ShoeArtProps) {
  const m = model ?? shoeModelFor(seed, colors, variant);
  const c = m.colors;
  const id = `shoe-${String(seed).replace(/[^a-z0-9-]/gi, "")}-${variant ?? "m"}`;

  const yH = G - OUT - m.soleHeel;
  const yT = G - OUT - m.soleToe - 3;
  const soleTop = (x: number) => yH + ((yT - yH) * (x - 18)) / (226 - 18);
  const top = COLLAR_TOP[m.collar];
  const laceStart = { x: 98, y: top + 2 };
  const laceEnd = { x: 166, y: 84 };
  const laceBend = { x: 140, y: laceStart.y + 18 };
  /** A point on the curved lace line, t from 0 at the collar to 1 at the vamp. */
  const along = (t: number) => ({
    x: (1 - t) ** 2 * laceStart.x + 2 * (1 - t) * t * laceBend.x + t ** 2 * laceEnd.x,
    y: (1 - t) ** 2 * laceStart.y + 2 * (1 - t) * t * laceBend.y + t ** 2 * laceEnd.y,
  });

  // How far the collar dips at the ankle. High and sock collars barely dip.
  const dip = m.collar === "high" ? 4 : m.collar === "sock" ? 8 : 14;
  const front =
    m.collar === "sock"
      ? `Q 84 ${top + 2} ${laceStart.x} ${laceStart.y}`
      : `Q 78 ${top + dip} 86 ${top + 2} L 92 ${top - 2} L ${laceStart.x} ${laceStart.y}`;
  const upper = [
    `M 26 ${yH + 2}`,
    // Heel leans back, then rounds over at the heel peak.
    `C 18 ${yH - 12} 14 ${top + 24} 20 ${top + 8}`,
    `Q 23 ${top - 2} 34 ${top - 1}`,
    // Collar runs down toward the ankle.
    `Q 54 ${top + 1} 70 ${top + dip}`,
    front,
    // Lace line, vamp and a low rounded toe.
    `Q ${laceBend.x} ${laceBend.y} ${laceEnd.x} ${laceEnd.y}`,
    `Q 204 ${92} 222 ${yT - 7}`,
    `Q 235 ${yT - 3} 232 ${yT + 3}`,
    `L 26 ${yH + 2} Z`,
  ].join(" ");
  const tongue = `M 74 ${top + 10} Q 76 ${top - 12} 90 ${top - 12} Q 102 ${top - 11} 102 ${top - 2} L ${laceEnd.x} ${laceEnd.y} Z`;
  const midsole = `M 16 ${yH} L 228 ${yT} Q 240 ${yT + 2} 236 ${G - OUT - 4} Q 228 ${G - OUT} 206 ${G - OUT} L 24 ${G - OUT} Q 14 ${G - OUT - 2} 16 ${yH} Z`;
  const outsole = `M 22 ${G - OUT} L 206 ${G - OUT} Q 228 ${G - OUT} 236 ${G - OUT - 4} Q 237 ${G - 1} 222 ${G} L 30 ${G} Q 20 ${G} 22 ${G - OUT} Z`;
  const treadColor = isDark(c.outsole) ? "#FFFFFF" : INK;
  const midLine = (x: number) => (soleTop(x) + G - OUT) / 2;

  return (
    <svg
      viewBox="0 0 240 150"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={`${id}-u`}>
          <path d={upper} />
        </clipPath>
        <clipPath id={`${id}-m`}>
          <path d={midsole} />
        </clipPath>
      </defs>
      <g stroke={INK} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
        {m.collar !== "sock" && <path d={tongue} fill={c.upper2} />}
        <path d={upper} fill={c.upper} />

        <g clipPath={`url(#${id}-u)`}>
          {m.heel === "panel" && <path d={`M 0 0 L 58 0 L 48 ${yH + 10} L 0 ${yH + 10} Z`} fill={c.upper2} />}
          {m.heel === "block" && <path d={`M 8 ${yH - 24} L 44 ${yH - 24} Q 54 ${yH - 10} 50 ${yH + 8} L 8 ${yH + 8} Z`} fill={c.upper2} />}
          {m.heel === "cage" && (
            <path
              d={`M 12 ${yH + 4} Q 14 ${yH - 26} 30 ${yH - 32} Q 48 ${yH - 36} 56 ${yH - 20} Q 64 ${yH - 4} 96 ${soleTop(96) + 4} L 12 ${yH + 4} Z`}
              fill={c.upper2}
            />
          )}
          {m.side === "dash" && <path d={`M 36 ${yH - 4} L 178 88 L 184 95 L 44 ${yH + 4} Z`} fill={c.graphic} />}
          {m.side === "wedge" && <path d={`M 50 ${yH + 4} L 148 80 L 158 90 L 124 ${soleTop(124) + 4} Z`} fill={c.graphic} />}
          {m.side === "bar" && <path d={`M 10 ${yH - 18} L 120 ${soleTop(120) - 14} L 120 ${soleTop(120) + 2} L 10 ${yH + 2} Z`} fill={c.graphic} />}
          {m.side === "ribs" &&
            Array.from({ length: 10 }, (_, i) => {
              const x = 58 + i * 11;
              return <path key={i} d={`M ${x} ${soleTop(x) + 2} L ${x + 24} 62`} stroke={c.graphic} strokeWidth={2.6} fill="none" />;
            })}
          {m.side === "saddle" &&
            (() => {
              const top1 = along(0.22);
              const top2 = along(0.66);
              const mid = (top1.y + soleTop(120)) / 2;
              return (
                <>
                  <path
                    d={`M ${top1.x} ${top1.y} L ${top2.x} ${top2.y} Q ${top2.x - 4} ${mid} 146 ${soleTop(146) + 4} L 104 ${soleTop(104) + 4} Q ${top1.x - 8} ${mid} ${top1.x} ${top1.y} Z`}
                    fill={c.graphic}
                  />
                  <path d={`M 118 ${mid + 2} L 132 ${mid + 1}`} stroke={c.upper} strokeWidth={3} />
                  <path d={`M 116 ${mid + 10} L 132 ${mid + 9}`} stroke={c.upper} strokeWidth={3} />
                </>
              );
            })()}
          {m.side === "mesh" && (
            <g fill={c.graphic} stroke="none" opacity={0.7}>
              {Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 16 }, (_, col) => (
                  <circle key={`${row}-${col}`} cx={34 + col * 12 + (row % 2) * 6} cy={60 + row * 10} r={1.7} />
                )),
              )}
            </g>
          )}
          {/* Collar lining */}
          <path d={`M 28 ${top} L 46 ${top - 2} Q 60 ${top + dip} 74 ${top + 4}`} fill="none" stroke={c.upper2} strokeWidth={6} />
        </g>
        {/* Outline again over the clipped panels, so edges stay crisp */}
        <path d={upper} fill="none" />

        {m.heelLoop && (
          <>
            <circle cx={27} cy={top - 5} r={6.5} fill="none" strokeWidth={7} />
            <circle cx={27} cy={top - 5} r={6.5} fill="none" stroke={c.upper2} strokeWidth={3.4} />
          </>
        )}

        {/* Laces */}
        <g stroke={c.lace} strokeWidth={4.2}>
          {[0.12, 0.36, 0.6, 0.84].map((t) => {
            const p = along(t);
            return <path key={t} d={`M ${p.x - 4} ${p.y + 5} L ${p.x + 6} ${p.y - 5}`} />;
          })}
        </g>
        <g fill="none" strokeWidth={1.2}>
          {[0.12, 0.36, 0.6, 0.84].map((t) => {
            const p = along(t);
            return <path key={t} d={`M ${p.x - 4} ${p.y + 5} L ${p.x + 6} ${p.y - 5}`} />;
          })}
        </g>

        {/* Midsole */}
        <path d={midsole} fill={c.midsole} />
        <g clipPath={`url(#${id}-m)`}>
          {m.soleSweep && <path d={`M 40 ${G} Q 120 ${G - OUT - 1} 186 ${soleTop(186) - 2} L 244 ${yT - 6} L 244 ${G} Z`} fill={c.midsole2} />}
          {m.soleStripe && <path d={`M 18 ${midLine(18)} L 232 ${midLine(232)}`} stroke={c.midsole2} strokeWidth={3.6} fill="none" />}
          {Array.from({ length: m.soleWindows }, (_, i) => {
            const x = 104 + i * 32;
            return (
              <path
                key={i}
                d={`M ${x} ${G - OUT - 3} L ${x + 20} ${G - OUT - 3} L ${x + 27} ${soleTop(x + 27) + 4} L ${x + 7} ${soleTop(x + 7) + 4} Z`}
                fill={c.upper2}
                strokeWidth={2}
              />
            );
          })}
          {m.airPod && (
            <>
              <rect x={92} y={soleTop(120) + 3} width={58} height={G - OUT - 3 - (soleTop(120) + 3)} rx={6} fill="#E4EDF3" strokeWidth={2} />
              <path d={`M 100 ${soleTop(120) + 7} L 142 ${soleTop(120) + 7}`} stroke="#FFFFFF" strokeWidth={2.4} />
            </>
          )}
          {m.heel === "window" && <path d={`M 28 ${G - OUT - 3} L 64 ${G - OUT - 3} L 46 ${yH + 3} Z`} fill={c.upper2} strokeWidth={2} />}
        </g>
        <path d={midsole} fill="none" />

        {m.toeGuard && (
          <path d={`M 198 ${G - OUT} Q 236 ${G - OUT} 236 ${yT - 2} Q 232 ${yT - 14} 212 ${yT - 12} Q 202 ${yT - 6} 198 ${G - OUT} Z`} fill={c.upper2} />
        )}

        {/* Outsole and tread */}
        <path d={outsole} fill={c.outsole} />
        {m.tread === "herringbone" && (
          <polyline
            points={Array.from({ length: 24 }, (_, i) => `${30 + i * 8},${i % 2 === 0 ? G - 2 : G - 5}`).join(" ")}
            fill="none"
            stroke={treadColor}
            strokeWidth={1.6}
            opacity={0.45}
          />
        )}
        {m.tread === "clay" && (
          <polyline
            points={Array.from({ length: 38 }, (_, i) => `${30 + i * 5},${i % 2 === 0 ? G - 1.8 : G - 4.6}`).join(" ")}
            fill="none"
            stroke={treadColor}
            strokeWidth={1.3}
            opacity={0.5}
          />
        )}
        {m.tread === "studs" && (
          <g fill={treadColor} stroke="none" opacity={0.45}>
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={i} cx={38 + i * 19} cy={G - 3} r={1.8} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

function isDark(hex: string): boolean {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
