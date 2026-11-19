import { COLORS, hashSeed, paletteFor, type GearColors } from "./palette";

export type ShoeArtProps = Partial<Omit<GearColors, "bg">> & {
  /** Any string or number. Different seeds give different colors and side patterns. */
  seed?: string | number;
  /** Pick the side pattern directly: 0 band, 1 zigzag, 2 dots, 3 color block, 4 perforations, 5 wave. */
  variant?: number;
  className?: string;
  /** Accessible name. Without it the art is decorative and hidden from screen readers. */
  title?: string;
};

const INK = COLORS.ink;

/** A stylized side-view tennis shoe. Original art with no brand marks. */
export default function ShoeArt({ seed = "shoe", variant, className, title, ...colors }: ShoeArtProps) {
  const hash = hashSeed(seed);
  const p = { ...paletteFor(seed), ...stripUndefined(colors) };
  // Every trait comes from a different slice of the hash, so each model gets its own mix.
  const pattern = (variant ?? (hash >>> 4)) % 6;
  const toeCap = ((hash >>> 8) & 1) === 0;
  const highCollar = ((hash >>> 9) & 1) === 0;
  const tread = (hash >>> 10) % 3;
  const dualMidsole = ((hash >>> 12) & 1) === 0;
  const heelTab = ((hash >>> 13) & 1) === 0;
  const toeDrag = ((hash >>> 14) & 1) === 0;

  return (
    <svg
      viewBox="0 0 240 150"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        {/* Tongue */}
        <path d={highCollar ? "M62 46 Q62 22 86 22 Q98 24 98 34 L106 66 Q92 60 82 50 Z" : "M64 46 Q66 30 84 30 Q94 31 95 38 L104 66 Q92 60 82 50 Z"} fill={p.lace === COLORS.paper ? p.accent : COLORS.paper} />
        {/* Upper */}
        <path
          d={
            highCollar
              ? "M26 106 L26 56 Q26 40 42 38 L64 37 Q76 38 82 50 L100 68 Q112 76 136 78 L178 82 Q214 86 226 104 L226 106 Z"
              : "M26 106 L26 62 Q26 48 40 46 L66 44 Q76 44 82 50 L100 68 Q112 76 136 78 L178 82 Q214 86 226 104 L226 106 Z"
          }
          fill={p.main}
        />
        {/* Heel counter */}
        <path d="M26 64 L26 106 L58 106 Q48 86 56 64 Q40 59 26 64 Z" fill={p.accent} />
        {/* Toe cap */}
        {toeCap && <path d="M180 82 Q214 86 226 104 L226 106 L186 106 Q174 96 180 82 Z" fill={p.accent} />}
        {/* Side pattern */}
        {pattern === 0 && <rect x={62} y={86} width={108} height={11} rx={5.5} fill={p.detail} />}
        {pattern === 1 && (
          <polyline points="60,98 72,86 84,98 96,86 108,98 120,86 132,98 144,86 156,98 166,88" fill="none" stroke={p.detail} strokeWidth={6} />
        )}
        {pattern === 1 && (
          <polyline points="60,98 72,86 84,98 96,86 108,98 120,86 132,98 144,86 156,98 166,88" fill="none" strokeWidth={1.5} />
        )}
        {pattern === 2 &&
          [
            [72, 92],
            [90, 88],
            [108, 94],
            [126, 89],
            [144, 94],
            [162, 92],
          ].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r={5} fill={p.detail} />)}
        {pattern === 3 && <path d="M64 102 L76 80 L130 82 L120 102 Z" fill={p.detail} />}
        {pattern === 4 &&
          [0, 1, 2].flatMap((row) =>
            [0, 1, 2, 3, 4, 5, 6].map((col) => (
              <circle key={`${row}-${col}`} cx={70 + col * 15 + row * 4} cy={84 + row * 7} r={2.2} fill={p.detail} strokeWidth={1.2} />
            )),
          )}
        {pattern === 5 && (
          <path d="M60 92 Q75 82 90 92 T120 92 T150 92 T168 88" fill="none" stroke={p.detail} strokeWidth={7} />
        )}
        {pattern === 5 && <path d="M60 92 Q75 82 90 92 T120 92 T150 92 T168 88" fill="none" strokeWidth={1.5} />}
        {/* Heel pull tab */}
        {heelTab && <path d={highCollar ? "M24 40 L34 38 L34 56 L24 58 Z" : "M24 48 L34 46 L34 62 L24 64 Z"} fill={p.detail} />}
        {/* Laces */}
        <g stroke={p.lace} strokeWidth={4.5}>
          <path d="M86 60 L96 52" />
          <path d="M97 69 L107 61" />
          <path d="M110 75 L118 67" />
          <path d="M124 78 L130 71" />
        </g>
        {/* Collar line */}
        <path d={highCollar ? "M32 52 Q34 44 44 43 L62 42" : "M32 58 Q33 51 42 50 L64 49"} fill="none" strokeWidth={2} />
        {/* Midsole */}
        <path d="M18 106 L224 104 Q234 106 232 115 L230 120 L18 121 Q14 114 18 106 Z" fill={p.base} />
        {dualMidsole && <path d="M22 114 L228 113" fill="none" stroke={p.accent} strokeWidth={4} />}
        {/* Toe guard that wraps up from the sole */}
        {toeDrag && <path d="M206 104 Q226 100 232 112 L230 120 L210 120 Q204 112 206 104 Z" fill={p.accent} />}
        {/* Outsole */}
        <path d="M18 121 L230 120 Q228 131 214 131 L32 132 Q18 132 18 121 Z" fill={INK} />
        {/* Tread: notches, herringbone or studs */}
        {tread === 0 && (
          <g stroke={p.base} strokeWidth={2.5} opacity={0.7}>
            {[44, 70, 96, 122, 148, 174, 200].map((x) => (
              <path key={x} d={`M${x} 124 L${x + 8} 128`} />
            ))}
          </g>
        )}
        {tread === 1 && (
          <polyline
            points="30,128 38,123 46,128 54,123 62,128 70,123 78,128 86,123 94,128 102,123 110,128 118,123 126,128 134,123 142,128 150,123 158,128 166,123 174,128 182,123 190,128 198,123 206,128 214,123"
            fill="none"
            stroke={p.base}
            strokeWidth={2}
            opacity={0.7}
          />
        )}
        {tread === 2 && (
          <g fill={p.base} stroke="none" opacity={0.75}>
            {[40, 62, 84, 106, 128, 150, 172, 194, 214].map((x) => (
              <circle key={x} cx={x} cy={126} r={2.6} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
