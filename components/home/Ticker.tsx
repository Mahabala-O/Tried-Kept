"use client";

import { useState } from "react";
import BallArt from "@/components/art/BallArt";
import s from "./home.module.css";

/**
 * The scrolling word strip. It only moves when motion is allowed, and the button
 * stops and restarts it for anyone, on touch and keyboard as well as mouse (WCAG 2.2.2).
 */
export default function Ticker({ words }: { words: string[] }) {
  const [paused, setPaused] = useState(false);
  const doubled = [...words, ...words];

  return (
    <div className={s.ticker} data-paused={paused}>
      <div className={s.tickerViewport} aria-hidden="true">
        <div className={s.tickerTrack}>
          {doubled.map((word, i) => (
            <span key={i} className={s.tickerItem}>
              {word}
              <BallArt className={s.tickerBall} />
            </span>
          ))}
        </div>
      </div>
      <button type="button" className={s.tickerToggle} onClick={() => setPaused((p) => !p)}>
        <span className="sr-only">{paused ? "Play the moving strip" : "Pause the moving strip"}</span>
        {paused ? (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M6 3 L17 10 L6 17 Z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="4" y="3" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="12" y="3" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
