import type { MetadataRoute } from "next";
import { comparisons, products, pros } from "@/lib/catalog";
import { gearStories } from "@/lib/editorial";
import { comparisonHref, storyHref } from "@/lib/navigation";
import { siteOrigin } from "@/lib/site";
import { libraryIndexPaths } from "@/lib/seo";

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
    ...libraryIndexPaths(),
    ...products.map((p) => `/gear/${p.slug}`),
    ...pros.map((p) => `/pros/${p.slug}`),
    ...comparisons.map((c) => comparisonHref(c.slug)),
    ...gearStories.map(storyHref),
  ];
  return [...new Set(paths)].map((path) => ({ url: `${siteOrigin()}${path}` }));
}

export function sitemapXml() {
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap()
    .map((entry) => `  <url><loc>${escape(entry.url)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
}
