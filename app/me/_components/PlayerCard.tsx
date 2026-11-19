import type { ReactNode } from "react";
import CountUp from "@/components/home/CountUp";
import { XpBar } from "@/components/ui";
import styles from "../me.module.css";

export type CardStat = { label: string; value: number };

type Level = {
  name: string;
  progress: number;
  next: { name: string; minXp: number } | null;
};

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
 * A player card: ball monogram on a court, name, level, XP and three counts.
 * Takes only public fields, so the same card is safe on the public profile.
 */
export default function PlayerCard({
  displayName,
  username,
  level,
  xp,
  surface,
  stats,
  layout = "wide",
  headingLevel = 1,
  children,
}: {
  displayName: string;
  username: string;
  level: Level;
  xp: number;
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
  const toNext = level.next ? level.next.minXp - xp : 0;

  return (
    <article className={`${styles.player} ${styles[layout]}`} aria-labelledby="player-name">
      <div className={`${styles.playerTop} band-${court} court-lines`}>
        <span className={`sticker sticker-paper ${styles.levelSticker} tilt-left`}>{level.name}</span>
        <div className={styles.monogram} aria-hidden="true">
          <span>{initialOf(displayName)}</span>
        </div>
        <span className={`sticker sticker-xp sticker-sm ${styles.xpSticker} tilt-right`}>
          <CountUp value={xp} /> XP
        </span>
      </div>

      <div className={styles.playerBody}>
        <div className={styles.playerName}>
          <Heading id="player-name">{displayName}</Heading>
          <p className={styles.handle}>@{username}</p>
        </div>

        <div className={styles.xpRow}>
          <div className={styles.xpLine}>
            {level.next ? (
              <>
                <span>Next up: {level.next.name}</span>
                <span>
                  <strong>{toNext.toLocaleString("en-US")}</strong> XP to go
                </span>
              </>
            ) : (
              <span>
                <strong>Top level</strong> reached
              </span>
            )}
          </div>
          <XpBar
            progress={level.progress}
            label={level.next ? `Progress from ${level.name} to ${level.next.name}` : `${level.name}, the top level`}
          />
        </div>

        <dl className={styles.stats}>
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
