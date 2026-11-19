import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/app/signup/_auth/AuthShell";
import MailPausedNotice from "@/app/signup/_auth/MailPausedNotice";
import DevOutbox from "@/components/DevOutbox";
import { mailReady } from "@/lib/mail";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  // The server action checks this too. Here it stops people filling a form that cannot work.
  const paused = !mailReady();

  return (
    <AuthShell
      eyebrow="Account"
      title="Reset your password"
      court="clay"
      lede="Enter the email on your account and we will send you a link."
      notice={paused ? <MailPausedNotice kind="reset" /> : undefined}
      below={
        <p>
          Remembered it? <Link href="/login">Log in</Link>
        </p>
      }
    >
      <ForgotPasswordForm paused={paused} />
      <DevOutbox />
    </AuthShell>
  );
}
