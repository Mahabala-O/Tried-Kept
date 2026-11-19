import type { PublicLockerRow } from "../_data";

/** Unlogged values stay visible as labelled gaps rather than disappearing. */
export function LockerFacts({ item }: { item: Pick<PublicLockerRow, "size" | "width" | "hours"> }) {
  return (
    <div className="row">
      <span className="tag">{item.size ? `Size ${item.size}` : "Size not logged"}</span>
      <span className="tag">{item.width ? `Width ${item.width}` : "Width not logged"}</span>
      <span className="tag">
        {item.hours !== null ? `${item.hours} ${item.hours === 1 ? "hour" : "hours"}` : "Hours not logged"}
      </span>
    </div>
  );
}
