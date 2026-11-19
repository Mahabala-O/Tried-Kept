"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { deleteReport, toggleHelpful } from "@/lib/actions/reports";
import type { ReportActionState } from "@/lib/reports";
import styles from "./reports.module.css";

const INITIAL: ReportActionState = {};

function countLabel(count: number): string {
  if (count === 0) return "No helpful votes yet";
  return count === 1 ? "1 player found this helpful" : `${count} players found this helpful`;
}

function CountText({ count }: { count: number }) {
  if (count === 0) return <span className={styles.helpfulCount}>{countLabel(0)}</span>;
  return (
    <span className={styles.helpfulCount}>
      <strong>{count}</strong> {count === 1 ? "player found this helpful" : "players found this helpful"}
    </span>
  );
}

/** A little tennis ball, filled once the viewer has marked the report helpful. */
function Ball({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={styles.helpfulBall} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill={on ? "#E6FF3D" : "#FFFFFF"} stroke="#0E2A2A" strokeWidth="2" />
      <path d="M5 5.5c3.2 3.6 3.2 9.4 0 13M19 5.5c-3.2 3.6-3.2 9.4 0 13" fill="none" stroke="#0E2A2A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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

  if (mode === "own") {
    return (
      <p className={styles.ownCount}>
        <Ball on={count > 0} />
        {countLabel(count)}
      </p>
    );
  }

  if (mode === "anon") {
    const here = `${pathname}${query ? `?${query}` : ""}#report-${reportId}`;
    return (
      <div className={styles.helpfulRow}>
        <Link href={`/login?next=${encodeURIComponent(here)}`} className={`btn ${styles.helpfulBtn}`}>
          <Ball on={false} />
          Log in to mark helpful
        </Link>
        <CountText count={count} />
      </div>
    );
  }

  return (
    <form action={action} className={styles.helpful}>
      <input type="hidden" name="reportId" value={reportId} />
      <div className={styles.helpfulRow}>
        <button type="submit" className={`btn ${styles.helpfulBtn}`} aria-pressed={voted} disabled={pending}>
          <Ball on={voted} />
          {voted ? "Marked helpful" : "Mark helpful"}
        </button>
        <CountText count={count} />
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
      <button type="button" className={`btn ${styles.deleteBtn}`} onClick={() => setConfirming(true)}>
        Delete report
      </button>
    );
  }

  return (
    <form action={action} className={styles.confirm}>
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
