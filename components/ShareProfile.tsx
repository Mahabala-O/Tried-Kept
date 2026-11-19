"use client";

import { useState } from "react";

type Result = { kind: "idle" } | { kind: "done"; message: string } | { kind: "manual"; url: string };

export default function ShareProfile({ username, displayName }: { username: string; displayName: string }) {
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
        <button type="button" className="btn" onClick={share}>
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
