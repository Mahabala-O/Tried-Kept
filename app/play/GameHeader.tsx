import Link from "next/link";
import type { ReactNode } from "react";
import s from "./play.module.css";

/** The colored court band at the top of each game screen. Kept short on phones so the game sits near the top. */
export default function GameHeader({
  title,
  lede,
  tone,
  art,
}: {
  title: string;
  lede: string;
  tone: "hardcourt" | "clay" | "grass";
  art: ReactNode;
}) {
  return (
    <header className={`band band-${tone} ${tone === "clay" ? "" : "court-lines"} ${s.gameHead}`}>
      <div className={`wrap ${s.gameHeadInner}`}>
        <Link href="/play" className={`chip ${s.back}`}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M12.5 4 L6.5 10 L12.5 16" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to games
        </Link>
        <div className={s.gameHeadRow}>
          <div className={s.gameHeadCopy}>
            <h1>{title}</h1>
            <p className="lede">{lede}</p>
          </div>
          <div className={s.gameHeadArt} aria-hidden="true">
            {art}
          </div>
        </div>
      </div>
    </header>
  );
}
