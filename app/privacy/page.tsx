import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Tried & Kept stores about you, how long it is kept and how to remove it.",
};

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const EyeIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2.5 12 Q12 3.5 21.5 12 Q12 20.5 2.5 12 Z" {...stroke} />
    <circle cx="12" cy="12" r="3.2" {...stroke} />
  </svg>
);

const LockIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" {...stroke} />
    <path d="M8.5 10.5 V8 Q8.5 4 12 4 Q15.5 4 15.5 8 V10.5" {...stroke} />
  </svg>
);

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string | string[] }>;
}) {
  const { deleted } = await searchParams;

  return (
    <div className="wrap page">
      <div className={`${styles.hero} band-ink`}>
        <span className="eyebrow">Your data</span>
        <h1>Privacy</h1>
        <p className="lede">What we store, what other people can see, how long we keep it and how to remove it.</p>
        {deleted === "1" && (
          <p role="status">
            <span className="sticker sticker-kept sticker-plain sticker-wrap tilt-none">Your account has been deleted.</span>
          </p>
        )}
      </div>

      <div className={styles.split}>
        <section className={`card ${styles.who} ${styles.public}`} aria-labelledby="public">
          <div className={styles.whoHead}>
            <span className={styles.icon}>{EyeIcon}</span>
            <h2 id="public">What anyone can see</h2>
          </div>
          <p>
            Your username, display name, bio, home surface and play level. The models in your locker
            with their status, size, width and hours. Your reports, including every detail you add to them.
          </p>
        </section>

        <section className={`card ${styles.who} ${styles.private}`} aria-labelledby="private">
          <div className={styles.whoHead}>
            <span className={styles.icon}>{LockIcon}</span>
            <h2 id="private">What only you can see</h2>
          </div>
          <p>
            Your email, weekly hours, the price you paid and your locker notes. We store a salted hash of your password,
            never the password itself.
          </p>
        </section>
      </div>

      <div className={styles.body}>
        <section className="stack" aria-labelledby="other-data">
          <h2 id="other-data">What we record in the background</h2>
          <p>
            <strong>Retailer clicks.</strong> Which offer you chose, which part of the site you came from, and your
            account if you are logged in.
          </p>
          <p>
            <strong>Security limits.</strong> A hashed form of your network address and short-lived counters, used to slow
            password guessing and mass signups.
          </p>
          <p>
            <strong>Your browser.</strong> A login cookie. If you join from Gear Match, your answers stay in this browser
            for up to a day so you do not have to answer again.
          </p>
          <p>
            <strong>Pictures from other sites.</strong> Some photos load from Wikimedia Commons (upload.wikimedia.org), and
            GIFs play through GIPHY&apos;s embed player (giphy.com). When they load, your browser contacts those sites,
            which can see your network address and browser type. We ask your browser not to send them the page you are on.
            GIPHY&apos;s player only loads once a clip is on screen, or when you tap Play clip if you have asked for less
            motion, and GIPHY&apos;s own privacy policy applies to it.
          </p>
        </section>

        <section className="stack" aria-labelledby="retention">
          <h2 id="retention">How long we keep it</h2>
          <ul className={styles.list}>
            <li>Your account, locker and reports stay until you delete them.</li>
            <li>Login sessions end after 30 days, or sooner if you log out.</li>
            <li>A signup nobody confirms is removed after two days.</li>
            <li>Confirmation links last 24 hours and password reset links last one hour.</li>
            <li>Security counters expire within one hour.</li>
            <li>
              Retailer click records have no fixed end date yet. Once your account is deleted they no longer connect to you.
            </li>
          </ul>
        </section>

        <section className="callout" aria-labelledby="removal">
          <h2 id="removal">How to remove it</h2>
          <p className="small">
            You can delete a single report or locker item at any time. To remove everything, go to{" "}
            <Link href="/me#account">your locker</Link>, open the account section and choose to delete your account. This
            removes your profile, email, locker, reports, votes and XP straight away.
          </p>
        </section>
      </div>
    </div>
  );
}
