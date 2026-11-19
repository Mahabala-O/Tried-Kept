import Link from "next/link";
import { GapNote, OfferButtons } from "@/components/ui";
import { comparisonsFor, getProduct, productLabel } from "@/lib/catalog";
import { costPerHour } from "@/lib/finder";
import type { LockerRow } from "../_data";
import { LockerFacts } from "./LockerFacts";
import LockerItemEditor from "./LockerItemEditor";

const tapLink = { display: "inline-flex", alignItems: "center", minHeight: 44 } as const;

export function LockerItemCard({ item }: { item: LockerRow }) {
  const product = getProduct(item.product_slug);
  const label = product ? productLabel(product) : "Model no longer listed";
  const related = product ? comparisonsFor(product.slug) : [];
  const cost = costPerHour(item.price_paid, item.hours);

  return (
    <article className="card">
      <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{label}</h4>

      <LockerFacts item={item} />

      {item.status !== "want" && (
        <p className="small">
          {cost !== null ? (
            <>
              Cost per hour: <strong>${cost.toFixed(2)}</strong>
            </>
          ) : (
            <span className="muted">Cost per hour: add the price paid and hours played to see this.</span>
          )}
        </p>
      )}

      {item.notes && (
        <p className="small muted" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {item.notes}
        </p>
      )}

      {product ? (
        <>
          {related.length > 0 ? (
            <div>
              <p className="small muted">Compare it</p>
              {related.map((comparison) => (
                <div key={comparison.slug}>
                  <Link href={`/compare/${comparison.slug}`} style={tapLink}>
                    {comparison.question}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <GapNote>
              No comparison covers this model yet. <Link href="/gear">Browse the gear list</Link> to see what else has
              been checked.
            </GapNote>
          )}

          {item.status === "want" && <OfferButtons product={product} from="own-gear" />}

          <div className="row">
            <Link href={`/report/new?product=${encodeURIComponent(product.slug)}`} className="btn">
              Add a report
            </Link>
            <Link href={`/gear/${product.slug}`} className="btn">
              View model
            </Link>
          </div>
        </>
      ) : (
        <GapNote>This model is no longer in the catalog. You can still remove it from your locker.</GapNote>
      )}

      <LockerItemEditor item={item} label={label} />
    </article>
  );
}
