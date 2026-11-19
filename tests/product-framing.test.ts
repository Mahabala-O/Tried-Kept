import { describe, it, expect } from "vitest";
import { productPhotos } from "@/lib/product-photos";
import { getProduct } from "@/lib/catalog";
import { photoFraming, framingGeometry } from "@/lib/product-framing";

describe("product-photo framing", () => {
  it("measures every current product photo and keeps crops inside the source", () => {
    for (const [slug, photo] of Object.entries(productPhotos)) {
      const frame = photoFraming(slug, photo.src, photo.width, photo.height);
      expect(frame.mode, slug).not.toBe("unmeasured");
      expect(frame.crop.left, slug).toBeGreaterThanOrEqual(0);
      expect(frame.crop.top, slug).toBeGreaterThanOrEqual(0);
      expect(frame.crop.width, slug).toBeGreaterThan(0);
      expect(frame.crop.height, slug).toBeGreaterThan(0);
      expect(frame.crop.left + frame.crop.width, slug).toBeLessThanOrEqual(frame.width);
      expect(frame.crop.top + frame.crop.height, slug).toBeLessThanOrEqual(frame.height);
    }
  });

  it("keeps each product silhouette inside square, thumbnail and wide tiles", () => {
    for (const [slug, photo] of Object.entries(productPhotos)) {
      const frame = photoFraming(slug, photo.src, photo.width, photo.height);
      const g = framingGeometry(frame, getProduct(slug)!.category);
      if (frame.mode !== "studio") continue;
      const angle = g.angle * Math.PI / 180;
      const points = frame.rotation?.support ?? [
        { x: frame.crop.left, y: frame.crop.top },
        { x: frame.crop.left + frame.crop.width, y: frame.crop.top },
        { x: frame.crop.left, y: frame.crop.top + frame.crop.height },
        { x: frame.crop.left + frame.crop.width, y: frame.crop.top + frame.crop.height },
      ];
      for (const [w, h] of [[343, 257], [160, 160], [40, 40], [280, 175]]) {
        const pad = Math.min(18, Math.max(6, w * .04));
        const scale = Math.min((w - 2 * pad) / g.fitWidth, (h - 2 * pad) / g.fitHeight);
        for (const point of points) {
            const x = point.x - g.centerX, y = point.y - g.centerY;
            const px = w / 2 + scale * (x * Math.cos(angle) - y * Math.sin(angle));
            const py = h / 2 + scale * (x * Math.sin(angle) + y * Math.cos(angle));
            expect(px, slug).toBeGreaterThanOrEqual(pad - .001);
            expect(px, slug).toBeLessThanOrEqual(w - pad + .001);
            expect(py, slug).toBeGreaterThanOrEqual(pad - .001);
            expect(py, slug).toBeLessThanOrEqual(h - pad + .001);
        }
      }
    }
  });

  it("discards stale measurements when a source image changes", () => {
    const f = photoFraming("yonex-ezone-98-2025", "https://example.com/new.jpg", 800, 1200);
    expect(f.mode).toBe("unmeasured");
    expect(f.crop).toEqual({ left: 0, top: 0, width: 800, height: 1200 });
    expect(framingGeometry(f, "racquet").angle).toBe(0);
  });
});
