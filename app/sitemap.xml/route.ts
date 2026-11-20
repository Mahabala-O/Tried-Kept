import { sitemapXml } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

/** Explicit XML escaping: this Next version's metadata serializer doesn't escape query separators. */
export function GET() {
  return new Response(sitemapXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
