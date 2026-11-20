import type { MetadataRoute } from "next";
import { comparisons, products, pros } from "@/lib/catalog";
import { gearStories } from "@/lib/editorial";
import { comparisonHref, storyHref } from "@/lib/navigation";
import { siteOrigin } from "@/lib/site";

/** Index the useful editorial library, including the canonical nested stories. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/gear",
    "/gear/compare",
    "/pros",
    "/disclosure",
    "/privacy",
    "/credits",
    ...products.map((p) => `/gear/${p.slug}`),
    ...pros.map((p) => `/pros/${p.slug}`),
    ...comparisons.map((c) => comparisonHref(c.slug)),
    ...gearStories.map(storyHref),
  ];
  return [...new Set(paths)].map((path) => ({ url: `${siteOrigin()}${path}` }));
}
