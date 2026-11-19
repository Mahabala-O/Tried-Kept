import type { ReactNode } from "react";
import BallArt from "@/components/art/BallArt";
import styles from "./auth.module.css";

export type Court = "hardcourt" | "clay" | "grass" | "ink";

/**
 * The frame every account page shares: a court-colored panel with the heading,
 * then the form in a card. On phones the panel stays short so the form is close.
 */
export default function AuthShell({
  eyebrow,
  title,
  lede,
  court = "hardcourt",
  stickers,
  perks,
  notice,
  children,
  below,
}: {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  court?: Court;
  /** A few stickers under the heading, such as "+10 XP". */
  stickers?: ReactNode;
  /** Short lines shown in the panel on wide screens only. */
  perks?: string[];
  /** Shown above the card, for something people must read before the form. */
  notice?: ReactNode;
  children: ReactNode;
  /** Links under the form, such as "Already joined? Log in". */
  below?: ReactNode;
}) {
  return (
    <div className={`wrap ${styles.shell}`}>
      <section className={`${styles.panel} band-${court} court-lines`} aria-labelledby="auth-title">
        <BallArt className={`${styles.panelBall}`} bounce />
        <div className={`stack ${styles.panelTop}`}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 id="auth-title">{title}</h1>
          {lede && <p className="lede">{lede}</p>}
        </div>
        {stickers && <div className={styles.stickers}>{stickers}</div>}
        {perks && perks.length > 0 && (
          <ul className={styles.perks}>
            {perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="stack-lg">
        {notice}
        <div className={`card ${styles.card}`}>
          {children}
          {below && <div className={`small ${styles.below}`}>{below}</div>}
        </div>
      </div>
    </div>
  );
}
