import type { Metadata } from "next";
import Link from "next/link";
import BallArt from "@/components/art/BallArt";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="stack-lg not-found">
        <BallArt bounce className="not-found-ball" />
        <div className="stack">
          <span className="sticker sticker-returned">Out!</span>
          <h1>That ball landed out</h1>
          <p className="lede">
            We could not find that page. The link may be out of date. These
            pages are a good place to pick up from.
          </p>
        </div>
        <div className="cta-row">
          <Link href="/gear" className="btn btn-primary btn-lg">
            Browse gear
          </Link>
          <Link href="/pros" className="btn">
            Browse pros
          </Link>
        </div>
      </div>
    </div>
  );
}
