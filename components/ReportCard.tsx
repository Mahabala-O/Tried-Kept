import Link from "next/link";
import HelpfulButton, { DeleteReportButton } from "@/components/HelpfulButton";
import { formatDate } from "@/components/ui";
import { getProduct, productLabel } from "@/lib/catalog";
import { outcomeLabel, surfaceLabel, type ReportView } from "@/lib/reports";

const USER_TEXT = { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } as const;

function ModelName({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product) return <>a model no longer in our catalog</>;
  return <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>;
}

export default function ReportCard({ report, viewerId }: { report: ReportView; viewerId: number | null }) {
  const isAuthor = viewerId === report.user_id;
  const isRacquet = getProduct(report.product_slug)?.category === "racquet";

  const facts: string[] = [];
  const missing: string[] = [];
  const note = (label: string, given: boolean, text: string) => {
    if (given) facts.push(text);
    else missing.push(label);
  };
  note("size", report.size !== "", `Size ${report.size}`);
  if (!isRacquet || report.width !== "") note("width", report.width !== "", `Width ${report.width}`);
  note("surface", report.surface !== "", surfaceLabel(report.surface));
  note("hours", report.hours !== null, `${report.hours} ${report.hours === 1 ? "hour" : "hours"}`);
  note("comfort", report.comfort !== null, `Comfort ${report.comfort} of 5`);

  return (
    <article className="card" id={`report-${report.id}`} style={{ overflowWrap: "anywhere" }}>
      <div className="row between">
        <span className={`tag tag-${report.outcome}`}>{outcomeLabel(report.outcome)}</span>
        <span className="small muted">{formatDate(report.created_at)}</span>
      </div>

      <h3>
        <ModelName slug={report.product_slug} />
      </h3>

      <p className="small muted">
        Reported by <Link href={`/u/${encodeURIComponent(report.username)}`}>{report.display_name}</Link> (@{report.username})
      </p>

      {report.switched_from_slug && (
        <p className="small">
          Switched from <ModelName slug={report.switched_from_slug} />
        </p>
      )}

      {facts.length > 0 && (
        <div className="row">
          {facts.map((fact) => (
            <span key={fact} className="tag">
              {fact}
            </span>
          ))}
        </div>
      )}

      <div>
        <p className="small muted">Reason</p>
        <p style={USER_TEXT}>{report.reason}</p>
      </div>

      {report.felt_different && (
        <div>
          <p className="small muted">What felt different</p>
          <p style={USER_TEXT}>{report.felt_different}</p>
        </div>
      )}

      {report.wear_location && (
        <div>
          <p className="small muted">Where it wore</p>
          <p style={USER_TEXT}>{report.wear_location}</p>
        </div>
      )}

      {report.string_setup && (
        <div>
          <p className="small muted">String, gauge and tension</p>
          <p style={USER_TEXT}>{report.string_setup}</p>
        </div>
      )}

      {missing.length > 0 && <p className="small muted">Not reported: {missing.join(", ")}.</p>}

      <div className="row between">
        <HelpfulButton
          reportId={report.id}
          count={report.helpful_count}
          voted={report.viewer_voted}
          mode={viewerId === null ? "anon" : isAuthor ? "own" : "vote"}
        />
        {isAuthor && <DeleteReportButton reportId={report.id} />}
      </div>
    </article>
  );
}
