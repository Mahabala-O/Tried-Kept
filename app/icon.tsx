import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

/** The same tennis-ball mark as the site header, rendered as a square search/browser icon. */
export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="192"
        height="192"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="#E6FF3D"
          stroke="#0E2A2A"
          strokeWidth="4"
        />
        <g fill="none" strokeLinecap="round">
          <path
            d="M20 19 Q46 50 20 81 M80 19 Q54 50 80 81"
            stroke="#0E2A2A"
            strokeWidth="8"
          />
          <path
            d="M20 19 Q46 50 20 81 M80 19 Q54 50 80 81"
            stroke="#FFFFFF"
            strokeWidth="4"
          />
        </g>
      </svg>
    ),
    size,
  );
}
