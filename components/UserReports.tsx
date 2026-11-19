import Link from "next/link";
import ReportCard from "@/components/ReportCard";
import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { countReports, listReports } from "@/lib/reports";

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
          <div className="callout">
            <p>You have not reported on any gear yet.</p>
            <div className="row">
              <Link href="/report/new" className="btn btn-primary">
                Write your first report
              </Link>
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
    <section className="stack" aria-labelledby="user-reports-heading">
      <div className="row between">
        <h2 id="user-reports-heading">Reports</h2>
        {viewerId === userId && (
          <Link href="/report/new" className="btn">
            Add a report
          </Link>
        )}
      </div>
      <div className="stack">
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
