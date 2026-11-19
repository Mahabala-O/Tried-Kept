import Link from "next/link";
import ReportCard from "@/components/ReportCard";
import { currentUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { listReports, outcomeTallies, recentReportReceipt } from "@/lib/reports";

const SHOWN = 20;

export default async function ProductReports({
  productSlug,
  justPublished = false,
}: {
  productSlug: string;
  /** Set after a report is published. The confirmation only shows if the server has the report. */
  justPublished?: boolean;
}) {
  const product = getProduct(productSlug);
  if (!product) return null;

  const viewer = await currentUser();
  const receipt = justPublished && viewer ? recentReportReceipt(viewer.id, product.slug) : null;
  const tallies = outcomeTallies(product.slug);
  const reportHref = `/report/new?product=${encodeURIComponent(product.slug)}`;
  // A comparison page shows this section once per model, so ids must differ by model.
  const sectionId = `reports-${product.slug}`;
  const headingId = `${sectionId}-heading`;

  if (tallies.total === 0) {
    return (
      <section className="stack" id={sectionId} aria-labelledby={headingId}>
        <h2 id={headingId}>What players report</h2>
        <div className="callout">
          <p>No one has reported on this model yet. Be the first.</p>
          <div className="row">
            <Link href={reportHref} className="btn btn-primary">
              Report on this model
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const reports = listReports({ productSlug: product.slug, limit: SHOWN, offset: 0, viewerId: viewer?.id ?? null });

  return (
    <section className="stack" id={sectionId} aria-labelledby={headingId}>
      <div className="row between">
        <h2 id={headingId}>What players report</h2>
        <Link href={reportHref} className="btn">
          Add your report
        </Link>
      </div>

      {receipt && (
        <p className="form-ok" role="status">
          Your report is published.{" "}
          {receipt.xp > 0 ? `You earned ${receipt.xp} XP.` : "You already earned the XP for reporting on this model."}
        </p>
      )}

      <div className="row" role="group" aria-label="Report outcomes">
        <span className="tag tag-kept">Kept: {tallies.kept}</span>
        <span className="tag tag-returned">Returned: {tallies.returned}</span>
        <span className="tag tag-rejected">Rejected: {tallies.rejected}</span>
        <span className="tag tag-testing">Testing: {tallies.testing}</span>
      </div>

      <div className="stack">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} viewerId={viewer?.id ?? null} />
        ))}
      </div>

      {tallies.total > SHOWN && (
        <p className="small">
          Showing the latest {SHOWN} of {tallies.total} reports.{" "}
          <Link href={`/community?product=${encodeURIComponent(product.slug)}`}>See all reports on this model</Link>
        </p>
      )}
    </section>
  );
}
