import measured from "./product-framing.json";
import type { Category } from "./catalog";

export type PhotoFraming = {
  source: string;
  width: number;
  height: number;
  mode: "studio" | "scene" | "unmeasured";
  crop: { left: number; top: number; width: number; height: number };
  brightness: number;
  rotation?: {
    angle: number; centerX: number; centerY: number; width: number; height: number;
    support: { x: number; y: number }[];
  };
};

/** Ignore measurements if a product's source photo has since been replaced. */
export function photoFraming(slug: string, source: string, width: number, height: number): PhotoFraming {
  const entry = (measured as Record<string, PhotoFraming>)[slug];
  return entry?.source === source ? entry : {
    source, width, height, mode: "unmeasured", brightness: 1,
    crop: { left: 0, top: 0, width, height },
  };
}

/** Fit the entire measured product, including when a racquet is angled. */
export function framingGeometry(frame: PhotoFraming, category: Category) {
  const angle = frame.mode === "studio" && category === "racquet" ? -32 : 0;
  if (angle && frame.rotation?.angle === angle) {
    return {
      angle, centerX: frame.rotation.centerX, centerY: frame.rotation.centerY,
      fitWidth: frame.rotation.width, fitHeight: frame.rotation.height,
    };
  }
  const radians = angle * Math.PI / 180;
  const c = Math.abs(Math.cos(radians)), s = Math.abs(Math.sin(radians));
  return {
    angle,
    centerX: frame.crop.left + frame.crop.width / 2,
    centerY: frame.crop.top + frame.crop.height / 2,
    fitWidth: frame.crop.width * c + frame.crop.height * s,
    fitHeight: frame.crop.height * c + frame.crop.width * s,
  };
}
