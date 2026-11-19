import type { CSSProperties } from "react";
import ResilientImage from "@/components/ResilientImage";
import { productIllustrationSrc, type Photo } from "@/lib/media";
import { photoFraming, framingGeometry } from "@/lib/product-framing";
import type { Product } from "@/lib/catalog";

/** Display-only crop: the original photograph and the full product stay intact. */
export default function ProductPhoto({ product, photo, eager = false }: {
  product: Pick<Product, "slug" | "category">;
  photo: Photo;
  eager?: boolean;
}) {
  const frame = photoFraming(product.slug, photo.src, photo.width, photo.height);
  const geometry = framingGeometry(frame, product.category);
  const style = {
    "--image-w": frame.width, "--image-h": frame.height,
    "--crop-cx": geometry.centerX, "--crop-cy": geometry.centerY,
    "--fit-w": geometry.fitWidth, "--fit-h": geometry.fitHeight,
    "--photo-angle": `${geometry.angle}deg`, "--photo-brightness": frame.brightness,
  } as CSSProperties;

  return <div className="product-photo" data-mode={frame.mode} style={style}>
    <ResilientImage src={photo.src} width={photo.width} height={photo.height} alt={photo.alt}
      loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer"
      fallbackSrc={productIllustrationSrc(product.slug)} fallbackLabel="Illustration"
      {...(eager ? { fetchPriority: "high" as const } : {})} />
  </div>;
}
