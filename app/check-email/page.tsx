import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/app/signup/_auth/AuthShell";
import styles from "@/app/signup/_auth/auth.module.css";
import DevOutbox from "@/components/DevOutbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Check your email", robots: { index: false } };

export default function CheckEmailPage() {
  return (
    <AuthShell
      eyebrow="One more step"
      title="Check your email"
      court="grass"
      lede="We sent the next step to the address you gave us. Confirmation links work for 24 hours."
    >
      <ol className={styles.steps}>
        <li>Open the email from Tried &amp; Kept.</li>
        <li>Tap the link inside.</li>
        <li>Press the button on the page it opens, and you are in.</li>
      </ol>
      <p className="small">
        Nothing there? Check your spam folder, or <Link href="/login">log in</Link> with your new password to get a
        fresh link.
      </p>
      <DevOutbox />
    </AuthShell>
  );
}
