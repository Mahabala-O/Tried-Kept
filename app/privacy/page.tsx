import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Tried & Kept stores about you, how long it is kept and how to remove it.",
};

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string | string[] }>;
}) {
  const { deleted } = await searchParams;

  return (
    <div className="wrap page">
      <div className="stack">
        <h1>Privacy</h1>
        <p className="lede">What we store, what other people can see, how long we keep it and how to remove it.</p>
        {deleted === "1" && (
          <p className="form-ok" role="status">
            Your account has been deleted.
          </p>
        )}
      </div>

      <div className="stack-lg" style={{ maxWidth: "68ch" }}>
        <section className="stack" aria-labelledby="public">
          <h2 id="public">What anyone can see</h2>
          <p>
            Your username, display name, bio, home surface, play level, level, XP and badges. The models in your locker
            with their status, size, width and hours. Your reports, including every detail you add to them.
          </p>
        </section>

        <section className="stack" aria-labelledby="private">
          <h2 id="private">What only you can see</h2>
          <p>
            Your email, weekly hours, the price you paid and your locker notes. We store a salted hash of your password,
            never the password itself.
          </p>
        </section>

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
        </section>

        <section className="stack" aria-labelledby="retention">
          <h2 id="retention">How long we keep it</h2>
          <ul className="stack" style={{ margin: 0, paddingLeft: 18 }}>
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

        <section className="stack" aria-labelledby="removal">
          <h2 id="removal">How to remove it</h2>
          <p>
            You can delete a single report or locker item at any time. To remove everything, go to{" "}
            <Link href="/me">your locker</Link>, open the account section and choose to delete your account. This removes
            your profile, email, locker, reports, votes and XP straight away.
          </p>
        </section>
      </div>
    </div>
  );
}
