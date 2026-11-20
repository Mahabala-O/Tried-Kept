import type { ReactNode } from "react";
import styles from "../me.module.css";

export type CardStat = { label: string; value: number };

/** Each home surface gets its own court color. Mixed or unset plays on ink. */
export function courtFor(surface: string): "hardcourt" | "clay" | "grass" | "ink" {
  if (surface === "hard") return "hardcourt";
  if (surface === "clay") return "clay";
  if (surface === "grass") return "grass";
  return "ink";
}

/** The first visible character of a name, for the ball monogram. */
function initialOf(name: string): string {
  const first = Array.from(name.trim())[0] ?? "?";
  return first.toLocaleUpperCase();
}

/**
 * A player card: ball monogram on a court, name and gear activity.
 * Takes only public fields, so the same card is safe on the public profile.
 */
export default function PlayerCard({
  displayName,
  username,
  surface,
  stats,
  layout = "wide",
  headingLevel = 1,
  children,
}: {
  displayName: string;
  username: string;
  /** The player's home surface value, which picks the court color. */
  surface: string;
  stats: CardStat[];
  layout?: "wide" | "portrait";
  headingLevel?: 1 | 2;
  /** Bio, facts and actions under the stats. */
  children?: ReactNode;
}) {
  const court = courtFor(surface);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <article className={`${styles.player} ${styles[layout]}`} aria-labelledby="player-name">
      <div className={`${styles.playerTop} band-${court} court-lines`}>
        <span className={`sticker sticker-paper ${styles.levelSticker} tilt-left`}>On court</span>
        <div className={styles.monogram} aria-hidden="true">
          <span>{initialOf(displayName)}</span>
        </div>

      </div>

      <div className={styles.playerBody}>
        <div className={styles.playerName}>
          <Heading id="player-name">{displayName}</Heading>
          <p className={styles.handle}>@{username}</p>
        </div>

        <dl className={styles.stats} style={{ gridTemplateColumns: `repeat(${Math.max(stats.length, 1)}, minmax(0, 1fr))` }}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value.toLocaleString("en-US")}</dd>
            </div>
          ))}
        </dl>

        {children}
      </div>
    </article>
  );
}
