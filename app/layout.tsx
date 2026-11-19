import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { levelFor, totalXp } from "@/lib/gamification";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tried & Kept", template: "%s · Tried & Kept" },
  description: "See what tennis players tried, kept and returned, then choose gear you will keep using.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const level = user ? levelFor(totalXp(getDb(), user.id)) : null;

  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand">
              Tried <span>&amp;</span> Kept
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/pros">Pros</Link>
              <Link href="/gear">Gear</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/play">Play</Link>
              <Link href="/community">Community</Link>
              {user && level ? (
                <>
                  <Link href="/me">My locker</Link>
                  <Link href="/me" className="nav-xp">
                    {level.name} · {level.xp} XP
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">Log in</Link>
                  <Link href="/signup" className="nav-xp">
                    Join
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap stack">
            <p>
              Retailer links may earn us a commission at no cost to you. Points are never tied to a positive review.{" "}
              <Link href="/disclosure">How this works</Link> · <Link href="/privacy">Privacy</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
