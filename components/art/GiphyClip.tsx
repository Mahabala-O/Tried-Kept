"use client";

import { useEffect, useRef, useState } from "react";
import ResilientImage from "@/components/ResilientImage";

type Props = {
  /** GIPHY's own embed player URL (lib/media.ts gifEmbedUrl). */
  embedUrl: string;
  alt: string;
  /** Who is in the clip, when it is a named player. */
  playerName?: string;
  channel: string;
  posterSrc?: string;
  posterAlt?: string;
};

/**
 * A GIPHY clip through GIPHY's documented iframe embed. Nothing is loaded from GIPHY
 * until the clip is on screen and motion is allowed. Under reduced motion it waits for
 * a tap. Before it loads, a credited portrait or original court illustration stays visible.
 * The button stops or restarts the clip at any time (WCAG 2.2.2).
 */
export default function GiphyClip({ embedUrl, alt, playerName, channel, posterSrc, posterAlt }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || stopped) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const onMotionChange = () => {
      if (motion.matches) setOn(false);
    };
    motion.addEventListener("change", onMotionChange);

    if (!("IntersectionObserver" in window)) {
      setOn(true);
      return () => motion.removeEventListener("change", onMotionChange);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
    };
  }, [stopped]);

  // A tap always wins over the automatic start, so a stopped clip stays stopped.
  const toggle = () => {
    setStopped(true);
    setLoadedUrl(null);
    setOn((value) => !value);
  };

  return (
    <div ref={boxRef} className="clip" style={{ position: "absolute", inset: 0 }}>
      <ResilientImage src={posterSrc ?? "/media/tennis-court.svg"}
        alt={posterAlt ?? "Illustrated tennis court while the clip is paused or loading"}
        loading="lazy" decoding="async"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {on ? (
        <iframe
          src={embedUrl}
          title={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allow=""
          onLoad={() => setLoadedUrl(embedUrl)}
          style={{ opacity: loadedUrl === embedUrl ? 1 : 0 }}
        />
      ) : (
        <div className="clip-poster-caption" aria-label={`Clip not playing: ${alt}`}>
          <span className="clip-card-kicker">GIF</span>
          <span className="clip-card-title">{playerName ?? "A tennis moment"}</span>
          <span className="small">from {channel} on GIPHY</span>
        </div>
      )}
      <button type="button" className="media-toggle media-toggle-wide" onClick={toggle}>
        {on ? (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="4" y="4" width="12" height="12" rx="1.5" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M6 3 L17 10 L6 17 Z" fill="currentColor" />
          </svg>
        )}
        {on ? "Stop clip" : "Play clip"}
      </button>
    </div>
  );
}
