import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import BottomNav from "@/components/BottomNav";
import SiteHeader from "@/components/SiteHeader";
import { currentUser } from "@/lib/auth";
import { mailReady } from "@/lib/mail";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://tried-kept-production.up.railway.app"),
  title: { default: "Tried & Kept", template: "%s · Tried & Kept" },
  description: "See what tennis players tried, kept and returned, then choose gear you will keep using.",
  openGraph: {
    type: "website",
    siteName: "Tried & Kept",
    title: "Tried & Kept — Find your next keeper.",
    description: "Compare tennis gear, explore pro bags, and share what you tried, kept or sent back.",
    images: [{ url: "/social/tried-and-kept-card-v1.png", width: 1200, height: 630,
      alt: "Tried & Kept — Find your next keeper. A colorful tennis court, racquet, ball and verdict stickers." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tried & Kept — Find your next keeper.",
    description: "Compare tennis gear, explore pro bags, and share what you tried, kept or sent back.",
    images: ["/social/tried-and-kept-card-v1.png"],
  },
  // Outside hosts (Wikimedia, GIPHY) get only our origin, never the page path.
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF7E6",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  // When email cannot be sent, sign-up is paused, so logged-out links point to log in instead.
  const signupsOpen = mailReady();

  return (
    // data-scroll-behavior lets Next turn smooth scrolling off during route changes, so new pages open at the top.
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader loggedIn={Boolean(user)} signupsOpen={signupsOpen} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap stack-lg">
            <p className="footer-brand" aria-hidden="true">
              Tried &amp; Kept
            </p>
            <p>
              Retailer links may earn us a commission at no cost to you. Reports reflect individual experiences.{" "}
              <Link href="/disclosure">How this works</Link> · <Link href="/privacy">Privacy</Link>
            </p>
            <ul className="footer-links" aria-label="More">
              <li>
                <Link href="/gear">Gear</Link>
              </li>
              <li>
                <Link href="/compare">Compare</Link>
              </li>
              <li>
                <Link href="/play">Tools &amp; games</Link>
              </li>
              <li>
                <Link href="/community">Community</Link>
              </li>
              <li>
                <Link href="/credits">Photo and GIF credits</Link>
              </li>
            </ul>
          </div>
        </footer>
        <BottomNav loggedIn={Boolean(user)} signupsOpen={signupsOpen} />
      </body>
    </html>
  );
}
