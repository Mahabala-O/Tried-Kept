import Link from "next/link";
import { ProductImage } from "@/components/MediaFrame";
import { GapNote, OfferButtons } from "@/components/ui";
import { comparisonsFor, getProduct, productLabel } from "@/lib/catalog";
import { costPerHour } from "@/lib/finder";
import type { LockerRow } from "../_data";
import { LOCKER_STATUSES } from "../_shared";
import styles from "../me.module.css";
import { LockerFacts } from "./LockerFacts";
import LockerItemEditor from "./LockerItemEditor";

const STATUS_STICKER = { using: "sticker-kept", retired: "sticker-paper", want: "sticker-blue" } as const;

export function LockerItemCard({ item }: { item: LockerRow }) {
  const product = getProduct(item.product_slug);
  const label = product ? productLabel(product) : "Model no longer listed";
  const related = product ? comparisonsFor(product.slug) : [];
  const cost = costPerHour(item.price_paid, item.hours);
  const status = LOCKER_STATUSES.find((s) => s.value === item.status);

  return (
    <article className={`card ${styles.item}`}>
      {product && <ProductImage product={product} ratio="16 / 10" />}

      <div className={styles.itemBody}>
        <div className={styles.itemTitle}>
          <h4>{product ? <Link href={`/gear/${product.slug}`}>{label}</Link> : label}</h4>
          {status && (
            <span className={`sticker sticker-sm ${STATUS_STICKER[item.status]} tilt-right`}>{status.label}</span>
          )}
        </div>

        <LockerFacts item={item} />

        {item.status !== "want" && (
          <p className={styles.cost}>
            {cost !== null ? (
              <>
                Cost per hour: <span className="sticker sticker-xp sticker-sm sticker-plain tilt-none">${cost.toFixed(2)}</span>
              </>
            ) : (
              <span className="muted">Cost per hour: add the price paid and hours played to see this.</span>
            )}
          </p>
        )}

        {item.notes && (
          <p className={styles.note}>
            <b>Private note</b>
            {item.notes}
          </p>
        )}

        {product ? (
          <>
            {related.length > 0 ? (
              <div className={styles.compare}>
                <p className="small muted">Compare it</p>
                {related.map((comparison) => (
                  <Link key={comparison.slug} href={`/compare/${comparison.slug}`}>
                    {comparison.question}
                  </Link>
                ))}
              </div>
            ) : (
              <GapNote>
                No comparison covers this model yet. <Link href="/gear">Browse the gear list</Link> to see what else has
                been checked.
              </GapNote>
            )}

            {item.status === "want" && <OfferButtons product={product} from="own-gear" />}

            <div className={styles.itemActions}>
              <Link href={`/report/new?product=${encodeURIComponent(product.slug)}`} className="btn btn-optic">
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
      </div>
    </article>
  );
}
