import type { Metadata } from "next";
import Link from "next/link";
import DevOutbox from "@/components/DevOutbox";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Account</span>
        <h1>Reset your password</h1>
        <p className="lede">Enter the email on your account and we will send you a link.</p>
      </div>
      <ForgotPasswordForm />
      <DevOutbox />
      <p>
        Remembered it? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
