import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/go/"] },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
