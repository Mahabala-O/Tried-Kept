import Link from "next/link";
import { BallArt, hashSeed } from "@/components/art";
import HelpfulButton, { DeleteReportButton } from "@/components/HelpfulButton";
import { ProductImage } from "@/components/MediaFrame";
import { formatDate } from "@/components/ui";
import { getProduct, productLabel } from "@/lib/catalog";
import { outcomeLabel, surfaceLabel, type Outcome, type ReportView } from "@/lib/reports";
import styles from "./reports.module.css";

/** The short word on the sticker. The full label stays for screen readers. */
const STICKER_WORD: Record<Outcome, string> = {
  kept: "Kept",
  returned: "Returned",
  rejected: "Rejected",
  testing: "Testing",
};

function ModelName({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product) return <>a model no longer in our catalog</>;
  return <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>;
}

function initialOf(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toLocaleUpperCase("en-US") : "?";
}

/** A pill linking to the author's profile, with their initial on a colored ball. */
export function AuthorChip({ username, displayName }: { username: string; displayName: string }) {
  const tone = hashSeed(username) % 5;
  return (
    <Link href={`/u/${encodeURIComponent(username)}`} className={styles.author}>
      <span className={`${styles.avatar} ${styles[`avatar_${tone}`]}`} aria-hidden="true">
        {initialOf(displayName)}
      </span>
      <span className={styles.authorText}>
        <span className={styles.authorName}>{displayName}</span>
        <span className={styles.authorHandle}>@{username}</span>
      </span>
    </Link>
  );
}

export default function ReportCard({ report, viewerId }: { report: ReportView; viewerId: number | null }) {
  const isAuthor = viewerId === report.user_id;
  const product = getProduct(report.product_slug);
  const isRacquet = product?.category === "racquet";

  const facts: { text: string; kind?: "surface" | "comfort" }[] = [];
  const missing: string[] = [];
  const note = (label: string, given: boolean, text: string, kind?: "surface" | "comfort") => {
    if (given) facts.push({ text, kind });
    else missing.push(label);
  };
  note("size", report.size !== "", `Size ${report.size}`);
  if (!isRacquet || report.width !== "") note("width", report.width !== "", `Width ${report.width}`);
  note("surface", report.surface !== "", surfaceLabel(report.surface), "surface");
  note("hours", report.hours !== null, `${report.hours} ${report.hours === 1 ? "hour" : "hours"}`);
  note("comfort", report.comfort !== null, `Comfort ${report.comfort} of 5`, "comfort");

  const tilt = report.id % 2 === 0 ? "tilt-right" : "tilt-left";

  return (
    <article className={`card ${styles.card}`} id={`report-${report.id}`}>
      <div className={styles.top}>
        {product ? (
          <ProductImage product={product} ratio="1 / 1" className={styles.thumb} />
        ) : (
          <div className={styles.thumbGone}>
            <BallArt />
          </div>
        )}
        <div className={styles.headline}>
          <span className={`sticker wiggle ${tilt} ${styles.outcome} ${styles[`outcome_${report.outcome}`]}`}>
            <span aria-hidden="true">{STICKER_WORD[report.outcome] ?? outcomeLabel(report.outcome)}</span>
            <span className="sr-only">Outcome: {outcomeLabel(report.outcome)}</span>
          </span>
          <h3 className={styles.title}>
            <ModelName slug={report.product_slug} />
          </h3>
          <span className={styles.date}>{formatDate(report.created_at)}</span>
        </div>
      </div>

      <div className={styles.byline}>
        <span className="sr-only">Reported by</span>
        <AuthorChip username={report.username} displayName={report.display_name} />
        {report.switched_from_slug && (
          <span className={styles.switched}>
            <span className={styles.switchedArrow} aria-hidden="true">
              &#8634;
            </span>
            <span>
              Switched from <ModelName slug={report.switched_from_slug} />
            </span>
          </span>
        )}
      </div>

      {facts.length > 0 && (
        <ul className={styles.facts} aria-label="Details">
          {facts.map((fact) => (
            <li key={fact.text} className={`${styles.fact} ${fact.kind ? styles[`fact_${fact.kind}`] : ""}`}>
              {fact.text}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.notes}>
        <div className={styles.note}>
          <p className={styles.noteLabel}>Reason</p>
          <p className={`${styles.noteText} ${styles.reason}`}>{report.reason}</p>
        </div>

        {report.felt_different && (
          <div className={styles.note}>
            <p className={styles.noteLabel}>What felt different</p>
            <p className={styles.noteText}>{report.felt_different}</p>
          </div>
        )}

        {report.wear_location && (
          <div className={styles.note}>
            <p className={styles.noteLabel}>Where it wore</p>
            <p className={styles.noteText}>{report.wear_location}</p>
          </div>
        )}

        {report.string_setup && (
          <div className={styles.note}>
            <p className={styles.noteLabel}>String, gauge and tension</p>
            <p className={styles.noteText}>{report.string_setup}</p>
          </div>
        )}
      </div>

      {missing.length > 0 && <p className={styles.missing}>Not reported: {missing.join(", ")}.</p>}

      <div className={styles.actions}>
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
