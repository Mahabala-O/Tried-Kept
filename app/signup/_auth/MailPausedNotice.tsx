import Link from "next/link";
import styles from "./auth.module.css";

export const PAUSED_NOTICE_ID = "mail-paused";

const COPY = {
  signup: {
    title: "Sign-ups are paused for now",
    body: "Email is not set up on this site yet, so we cannot send the link that confirms a new account. The form is switched off until it is, so you do not fill it in for nothing.",
  },
  reset: {
    title: "Password resets are paused for now",
    body: "Email is not set up on this site yet, so we cannot send a reset link. The form is switched off until it is.",
  },
} as const;

/** Shown above a form that needs email, when the site has no mail provider configured. */
export default function MailPausedNotice({ kind }: { kind: keyof typeof COPY }) {
  const copy = COPY[kind];
  return (
    <section className={styles.paused} id={PAUSED_NOTICE_ID} aria-labelledby={`${PAUSED_NOTICE_ID}-title`}>
      <span className="sticker sticker-returned sticker-sm tilt-left">Paused</span>
      <h2 id={`${PAUSED_NOTICE_ID}-title`}>{copy.title}</h2>
      <p>{copy.body}</p>
      <p className="small">You can still look around while we sort it out.</p>
      <div className={styles.pausedActions}>
        <Link href="/gear" className="btn">
          Browse the gear
        </Link>
        <Link href="/play" className="btn">
          Play a game
        </Link>
        {kind === "reset" && (
          <Link href="/login" className="btn">
            Back to log in
          </Link>
        )}
      </div>
    </section>
  );
}
