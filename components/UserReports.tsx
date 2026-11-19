import Link from "next/link";
import { BallArt } from "@/components/art";
import ReportCard from "@/components/ReportCard";
import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { countReports, listReports } from "@/lib/reports";
import styles from "./reports.module.css";

const SHOWN = 50;

export default async function UserReports({ userId }: { userId: number }) {
  const viewer = await currentUser();
  const viewerId = viewer?.id ?? null;
  const total = countReports({ userId });

  if (total === 0) {
    return (
      <section className="stack" aria-labelledby="user-reports-heading">
        <h2 id="user-reports-heading">Reports</h2>
        {viewerId === userId ? (
          <div className={`callout ${styles.empty}`}>
            <BallArt bounce className={styles.emptyBall} />
            <div className="stack">
              <p>You have not reported on any gear yet.</p>
              <span className="small">Kept it, returned it or still testing? Every honest report helps the next player.</span>
              <div className="cta-row">
                <Link href="/report/new" className="btn btn-primary">
                  Write your first report
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">No reports from this player yet.</p>
        )}
      </section>
    );
  }

  const reports = listReports({ userId, limit: SHOWN, offset: 0, viewerId });
  const author = getDb().prepare("SELECT username FROM users WHERE id = ?").get(userId) as
    | { username: string }
    | undefined;

  return (
    <section className="stack-lg" aria-labelledby="user-reports-heading">
      <div className={styles.sectionHead}>
        <h2 id="user-reports-heading">
          Reports <span className={`sticker sticker-paper sticker-sm tilt-right ${styles.headCount}`}>{total}</span>
        </h2>
        {viewerId === userId && (
          <Link href="/report/new" className="btn btn-optic">
            Add a report
          </Link>
        )}
      </div>
      <div className={styles.list}>
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} viewerId={viewerId} />
        ))}
      </div>
      {total > SHOWN && (
        <p className="small muted">
          Showing the latest {SHOWN} of {total} reports.{" "}
          {author && (
            <Link href={`/community?player=${encodeURIComponent(author.username)}`}>See all of these reports</Link>
          )}
        </p>
      )}
    </section>
  );
}
