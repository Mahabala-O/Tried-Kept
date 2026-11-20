import Link from "next/link";
import { getComparison } from "@/lib/catalog";
export default function ScoutMark({
  comparisonSlug,
}: {
  comparisonSlug: string;
}) {
  const comparison = getComparison(comparisonSlug);
  if (!comparison) return null;
  return (
    <aside className="callout stack">
      <h3>What would you try next?</h3>
      <p>
        Keep the tradeoffs in mind, try a pair, then record what changed from
        your old gear.
      </p>
      <div className="cta-row">
        <Link href="/switch" className="btn btn-primary">
          Plan a gear switch
        </Link>
        <Link
          href={`/report/new?product=${comparison.productSlugs[0]}`}
          className="btn"
        >
          Log a trial
        </Link>
      </div>
    </aside>
  );
}
