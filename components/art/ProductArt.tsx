import type { CSSProperties } from "react";
import { productLabel, type Product } from "@/lib/catalog";
import { paletteFor } from "./palette";
import RacquetArt from "./RacquetArt";
import ShoeArt, { shoeModelFor } from "./ShoeArt";
import ApparelArt, { apparelShape } from "./ApparelArt";

type Props = {
  product: Pick<Product, "slug" | "category" | "brand" | "name" | "line">;
  className?: string;
  /** CSS aspect ratio for the tile, e.g. "4 / 3". */
  ratio?: string;
  /** Hide the "Illustration" label, only where the page already says it is art. */
  hideLabel?: boolean;
};

/**
 * Original art standing in for a product photo. Shoes are drawn from each model's
 * real shape and a colorway it is sold in (components/art/shoeModels.ts). The label makes clear it is not a picture of the product.
 */
export default function ProductArt({ product, className, ratio, hideLabel = false }: Props) {
  const palette = paletteFor(product.slug);
  const bg = product.category === "shoe" ? shoeModelFor(product.slug).colors.bg : palette.bg;
  const kind = product.category === "racquet" ? "tennis racquet" : product.category === "shoe" ? "tennis shoe" : product.category === "sock" ? "pair of socks" : "tennis garment";
  const style = { "--art-bg": bg, ...(ratio ? { "--ratio": ratio } : {}) } as CSSProperties;
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
      ) : product.category === "shoe" ? (
        <ShoeArt seed={product.slug} />
      ) : (
        <ApparelArt shape={apparelShape(product.category, product.name)} />
      )}
    </div>
  );
}
