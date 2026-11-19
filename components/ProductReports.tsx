import type { CSSProperties } from "react";
import Link from "next/link";
import { BallArt } from "@/components/art";
import ReportCard from "@/components/ReportCard";
import { currentUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { listReports, outcomeTallies, recentReportReceipt, type OutcomeTallies } from "@/lib/reports";
import styles from "./reports.module.css";

const SHOWN = 20;

const METER: { key: "kept" | "returned" | "rejected" | "testing"; label: string }[] = [
  { key: "kept", label: "Kept" },
  { key: "returned", label: "Returned" },
  { key: "rejected", label: "Rejected" },
  { key: "testing", label: "Testing" },
];

/** A split bar of the real counts, with a ball rolled to the end of the kept share. */
export function OutcomeMeter({ tallies, label = "Report outcomes" }: { tallies: OutcomeTallies; label?: string }) {
  const keptShare = tallies.total > 0 ? (tallies.kept / tallies.total) * 100 : 0;
  const ballStyle = { left: `clamp(13px, ${keptShare}%, calc(100% - 13px))` } as CSSProperties;
  return (
    <div className={styles.meter}>
      <p className={styles.meterTotal}>
        <span className={styles.meterNumber}>{tallies.total}</span>
        <span className={styles.meterWord}>
          {tallies.total === 1 ? "report" : "reports"} · {tallies.kept} kept
        </span>
      </p>
      <div className={styles.bar} aria-hidden="true">
        {METER.filter((m) => tallies[m.key] > 0).map((m, i) => (
          <span
            key={m.key}
            className={`${styles.seg} ${styles[`seg_${m.key}`]}`}
            style={{ flexGrow: tallies[m.key], flexBasis: 0, animationDelay: `${i * 90}ms` }}
          />
        ))}
        <span className={styles.barBall} style={ballStyle}>
          <BallArt />
        </span>
      </div>
      <ul className={styles.legend} aria-label={label}>
        {METER.map((m) => (
          <li key={m.key} className={styles.legendItem}>
            <span className={`${styles.dot} ${styles[`dot_${m.key}`]}`} aria-hidden="true" />
            <span>{m.label}</span>
            <strong>
              <span className="sr-only">: </span>
              {tallies[m.key]}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
        <span className="eyebrow">From the community</span>
        <h2 id={headingId}>What players report</h2>
        <div className={`callout ${styles.empty}`}>
          <BallArt bounce className={styles.emptyBall} />
          <div className="stack">
            <p>No one has reported on this model yet. Be the first.</p>
            <div className="cta-row">
              <Link href={reportHref} className="btn btn-primary">
                Report on this model
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const reports = listReports({ productSlug: product.slug, limit: SHOWN, offset: 0, viewerId: viewer?.id ?? null });

  return (
    <section className="stack-lg" id={sectionId} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <div>
          <span className="eyebrow">From the community</span>
          <h2 id={headingId}>What players report</h2>
        </div>
        <Link href={reportHref} className="btn btn-optic">
          Add your report
        </Link>
      </div>

      {receipt && (
        <div className={styles.receipt} role="status">
          {receipt.xp > 0 && (
            <span className="sticker sticker-xp pop-in tilt-left" aria-hidden="true">
              +{receipt.xp} XP
            </span>
          )}
          <p>
            Your report is published.{" "}
            {receipt.xp > 0 ? `You earned ${receipt.xp} XP.` : "You already earned the XP for reporting on this model."}
          </p>
        </div>
      )}

      <OutcomeMeter tallies={tallies} />

      <div className={styles.list}>
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
