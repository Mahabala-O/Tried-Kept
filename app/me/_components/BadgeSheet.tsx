import type { Badge } from "@/lib/gamification";
import styles from "../me.module.css";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Check = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5 L10 17.5 L19 7" {...stroke} />
  </svg>
);

const Lock = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" {...stroke} />
    <path d="M8.5 10.5 V8 Q8.5 4 12 4 Q15.5 4 15.5 8 V10.5" {...stroke} />
  </svg>
);

/** Badges as a sheet of stickers. Earned ones are bright; locked ones are outlines. */
export default function BadgeSheet({ badges, label }: { badges: Badge[]; label: string }) {
  return (
    <ul className={styles.sheet} aria-label={label}>
      {badges.map((badge) => (
        <li key={badge.id} className={`${styles.badge} ${badge.earned ? `${styles.earned} wiggle` : styles.locked}`}>
          <span className={styles.emblem}>{badge.earned ? Check : Lock}</span>
          <strong>{badge.name}</strong>
          <p>{badge.description}</p>
          <span className={styles.badgeState}>{badge.earned ? "Earned" : "Locked"}</span>
        </li>
      ))}
    </ul>
  );
}
