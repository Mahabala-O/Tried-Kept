type Shape = "socks" | "top" | "shorts" | "skirt";
export function apparelShape(category: string, name: string): Shape {
  if (category === "sock") return "socks";
  if (/shorts/i.test(name)) return "shorts";
  if (/skirt/i.test(name)) return "skirt";
  return "top";
}

/** Generic, original fallback shapes. Never a drawing of a brand's exact garment. */
export default function ApparelArt({ shape }: { shape: Shape }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <g stroke="#0e2a2a" strokeWidth="5" strokeLinejoin="round">
        {shape === "top" && (
          <path
            d="m108 54-62 41 28 58 34-17v135h104V136l34 17 28-58-62-41c-5 38-99 38-104 0Z"
            fill="#a9c6ff"
          />
        )}
        {shape === "shorts" && (
          <path d="M70 65h180l-10 206h-66l-14-91-14 91H80Z" fill="#a9c6ff" />
        )}
        {shape === "skirt" && (
          <path d="M104 58h112l50 212H54Z" fill="#a9c6ff" />
        )}
        {shape === "socks" && (
          <>
            <path
              d="M104 44h64v150l40 32c27 22 11 56-17 56h-71c-21 0-34-19-27-38l11-33Z"
              fill="#f4f7ee"
            />
            <path
              d="M170 34h64v150l40 32c27 22 11 56-17 56h-25"
              fill="#e6ff3d"
            />
          </>
        )}
        <path
          d={
            shape === "socks"
              ? "M106 75h58m8-11h58"
              : shape === "top"
                ? "M110 249h100"
                : "M77 88h165"
          }
        />
      </g>
    </svg>
  );
}
