import type { CSSProperties } from "react";
import { productLabel, type Product } from "@/lib/catalog";
import { paletteFor } from "./palette";
import RacquetArt from "./RacquetArt";
import ShoeArt from "./ShoeArt";

type Props = {
  product: Pick<Product, "slug" | "category" | "brand" | "name" | "line">;
  className?: string;
  /** CSS aspect ratio for the tile, e.g. "4 / 3". */
  ratio?: string;
  /** Hide the "Illustration" label, only where the page already says it is art. */
  hideLabel?: boolean;
};

/**
 * Original art standing in for a product photo. Colors come from the slug, so each
 * model keeps its own look. The label makes clear it is not a picture of the product.
 */
export default function ProductArt({ product, className, ratio, hideLabel = false }: Props) {
  const palette = paletteFor(product.slug);
  const kind = product.category === "racquet" ? "tennis racquet" : "tennis shoe";
  const style = { "--art-bg": palette.bg, ...(ratio ? { "--ratio": ratio } : {}) } as CSSProperties;
  return (
    <div
      className={className ? `art-frame ${className}` : "art-frame"}
      style={style}
      role="img"
      aria-label={`Illustration of a ${kind}, not a photo of the ${productLabel(product as Product)}`}
    >
      {!hideLabel && (
        <span className="art-label" aria-hidden="true">
          <span className="art-label-long">Illustration</span>
          <span className="art-label-short">Art</span>
        </span>
      )}
      {product.category === "racquet" ? (
        <RacquetArt seed={product.slug} frame={palette.main} accent={palette.accent} grip={palette.detail} />
      ) : (
        <ShoeArt
          seed={product.slug}
          main={palette.main}
          accent={palette.accent}
          detail={palette.detail}
          base={palette.base}
          lace={palette.lace}
        />
      )}
    </div>
  );
}
