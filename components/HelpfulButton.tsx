"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { deleteReport, toggleHelpful } from "@/lib/actions/reports";
import type { ReportActionState } from "@/lib/reports";

const INITIAL: ReportActionState = {};

function countLabel(count: number): string {
  if (count === 0) return "No helpful votes yet";
  return count === 1 ? "1 player found this helpful" : `${count} players found this helpful`;
}

type Props = {
  reportId: number;
  count: number;
  voted: boolean;
  /** "vote" for other players, "own" for the author, "anon" when logged out. */
  mode: "vote" | "own" | "anon";
};

export default function HelpfulButton({ reportId, count, voted, mode }: Props) {
  const [state, action, pending] = useActionState(toggleHelpful, INITIAL);
  const pathname = usePathname();
  const query = useSearchParams().toString();

  if (mode === "own") return <p className="small muted">{countLabel(count)}</p>;

  if (mode === "anon") {
    const here = `${pathname}${query ? `?${query}` : ""}#report-${reportId}`;
    return (
      <div className="row">
        <Link href={`/login?next=${encodeURIComponent(here)}`} className="btn">
          Log in to mark helpful
        </Link>
        <span className="small muted">{countLabel(count)}</span>
      </div>
    );
  }

  return (
    <form action={action} className="stack">
      <input type="hidden" name="reportId" value={reportId} />
      <div className="row">
        <button type="submit" className={voted ? "btn btn-primary" : "btn"} aria-pressed={voted} disabled={pending}>
          {voted ? "Marked helpful" : "Mark helpful"}
        </button>
        <span className="small muted">{countLabel(count)}</span>
      </div>
      {state.error && (
        <p className="form-error small" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

/** Deleting cannot be undone, so it takes a second, deliberate tap. */
export function DeleteReportButton({ reportId }: { reportId: number }) {
  const [state, action, pending] = useActionState(deleteReport, INITIAL);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="btn" onClick={() => setConfirming(true)}>
        Delete report
      </button>
    );
  }

  return (
    <form action={action} className="stack">
      <input type="hidden" name="reportId" value={reportId} />
      <p className="small">Delete this report? This cannot be undone.</p>
      <div className="row">
        <button type="submit" className="btn btn-shop" disabled={pending}>
          {pending ? "Deleting" : "Yes, delete"}
        </button>
        <button type="button" className="btn" onClick={() => setConfirming(false)} disabled={pending}>
          Keep report
        </button>
      </div>
      {state.error && (
        <p className="form-error small" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
