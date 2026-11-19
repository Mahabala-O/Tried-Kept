import Link from "next/link";
import s from "@/components/games.module.css";
import { scoutComparison } from "@/lib/actions/game";
import { currentUser } from "@/lib/auth";
import { getComparison } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { XP } from "@/lib/gamification";

export default async function ScoutMark({ comparisonSlug }: { comparisonSlug: string }) {
  const comparison = getComparison(comparisonSlug);
  if (!comparison) return null;

  const user = await currentUser();

  if (!user) {
    return (
      <div className={`card seam ${s.scout}`}>
        <div className={s.scoutHead}>
          <h3>Worked through this one?</h3>
          <span className="sticker sticker-xp sticker-sm tilt-right">+{XP.comparisonScouted} XP</span>
        </div>
        <p className="small muted">Join to mark this comparison as worked through and earn {XP.comparisonScouted} XP.</p>
        <div className="cta-row">
          <Link href={`/signup?next=${encodeURIComponent(`/compare/${comparison.slug}`)}`} className="btn btn-primary">
            Join
          </Link>
          <Link href={`/login?next=${encodeURIComponent(`/compare/${comparison.slug}`)}`} className="btn">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const done = getDb()
    .prepare("SELECT 1 AS done FROM xp_events WHERE user_id = ? AND event_key = ?")
    .get(user.id, `compare:${comparison.slug}`);

  if (done) {
    return (
      <div className={`card ${s.scout} ${s.scoutDone}`}>
        <div className="row">
          <span className="sticker sticker-kept tilt-left">Worked through</span>
        </div>
        <p className="small muted">You marked this comparison as worked through. Its XP is counted.</p>
      </div>
    );
  }

  return (
    <form action={scoutComparison} className={`card seam ${s.scout}`}>
      <input type="hidden" name="slug" value={comparison.slug} />
      <div className={s.scoutHead}>
        <h3>Worked through this one?</h3>
        <span className="sticker sticker-xp sticker-sm tilt-right">+{XP.comparisonScouted} XP</span>
      </div>
      <p className="small muted">Mark it once you have read both sides. Your pick does not matter for XP.</p>
      <div className="cta-row">
        <button type="submit" className="btn btn-optic btn-lg">
          Mark as worked through (+{XP.comparisonScouted} XP)
        </button>
      </div>
    </form>
  );
}
