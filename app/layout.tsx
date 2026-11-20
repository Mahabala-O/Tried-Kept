import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import BottomNav from "@/components/BottomNav";
import SiteHeader from "@/components/SiteHeader";
import { siteOrigin } from "@/lib/site";
import { siteGraph } from "@/lib/structured-data";
import { StructuredData } from "@/components/StructuredData";
import "./globals.css";
import "./dark.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: "Tried & Kept", template: "%s · Tried & Kept" },
  description:
    "Explore tennis shoes, racquets and pro equipment, with sourced strengths, tradeoffs and comparisons.",
  openGraph: {
    type: "website",
    siteName: "Tried & Kept",
    title: "Tried & Kept — Find your next keeper.",
    description:
      "Explore tennis gear, understand the tradeoffs, and see the stories behind pro setups.",
    images: [
      {
        url: "/social/tried-and-kept-card-v1.png",
        width: 1200,
        height: 630,
        alt: "Tried & Kept — Find your next keeper. A colorful tennis court, racquet, ball and verdict stickers.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tried & Kept — Find your next keeper.",
    description:
      "Explore tennis gear, understand the tradeoffs, and see the stories behind pro setups.",
    images: ["/social/tried-and-kept-card-v1.png"],
  },
  // Outside hosts (Wikimedia, GIPHY) get only our origin, never the page path.
  referrer: "strict-origin-when-cross-origin",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF7E6" },
    { media: "(prefers-color-scheme: dark)", color: "#101c1e" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // data-scroll-behavior lets Next turn smooth scrolling off during route changes, so new pages open at the top.
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StructuredData value={siteGraph()} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap stack-lg">
            <p className="footer-brand" aria-hidden="true">
              Tried &amp; Kept
            </p>
            <p>
              Retailer links may earn us a commission at no cost to you. Our
              advice links to its sources.{" "}
              <Link href="/disclosure">How this works</Link> ·{" "}
              <Link href="/privacy">Privacy</Link>
            </p>
            <ul className="footer-links" aria-label="More">
              <li>
                <Link href="/gear">Catalogue</Link>
              </li>
              <li>
                <Link href="/pros">Pros</Link>
              </li>
              <li>
                <Link href="/credits">Photo and GIF credits</Link>
              </li>
            </ul>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
