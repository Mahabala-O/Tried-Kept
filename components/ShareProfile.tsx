"use client";

import { useState } from "react";

type Result = { kind: "idle" } | { kind: "done"; message: string } | { kind: "manual"; url: string };

const ShareIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3.5 V14.5 M7.5 8 L12 3.5 L16.5 8 M5 12 V19 Q5 20.5 6.5 20.5 H17.5 Q19 20.5 19 19 V12"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ShareProfile({
  username,
  displayName,
  className = "btn",
}: {
  username: string;
  displayName: string;
  /** Button classes, such as "btn btn-optic" where sharing is the main action. */
  className?: string;
}) {
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function share() {
    const url = `${window.location.origin}/u/${encodeURIComponent(username)}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${displayName} on Tried & Kept`, url });
        setResult({ kind: "done", message: "Profile shared." });
        return;
      } catch (error) {
        // Closing the share sheet is a choice, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setResult({ kind: "done", message: "Link copied." });
    } catch {
      setResult({ kind: "manual", url });
    }
  }

  return (
    <div className="stack">
      <div>
        <button type="button" className={className} onClick={share} style={{ width: "100%" }}>
          {ShareIcon}
          Share profile
        </button>
      </div>
      <div role="status" aria-live="polite">
        {result.kind === "done" && <p className="form-ok small">{result.message}</p>}
        {result.kind === "manual" && (
          <div className="field">
            <label htmlFor={`share-${username}`}>Copy this link</label>
            <input
              id={`share-${username}`}
              readOnly
              value={result.url}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
