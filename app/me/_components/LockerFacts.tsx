import type { PublicLockerRow } from "../_data";
import styles from "../me.module.css";

/** Unlogged values stay visible as labelled gaps rather than disappearing. */
export function LockerFacts({ item }: { item: Pick<PublicLockerRow, "size" | "width" | "hours"> }) {
  return (
    <div className={styles.facts}>
      <span className={item.size ? "tag" : `tag ${styles.factGap}`}>{item.size ? `Size ${item.size}` : "Size not logged"}</span>
      <span className={item.width ? "tag" : `tag ${styles.factGap}`}>{item.width ? `Width ${item.width}` : "Width not logged"}</span>
      <span className={item.hours !== null ? "tag tag-testing" : `tag ${styles.factGap}`}>
        {item.hours !== null ? `${item.hours} ${item.hours === 1 ? "hour" : "hours"}` : "Hours not logged"}
      </span>
    </div>
  );
}
