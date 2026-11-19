import type { Metadata } from "next";
import Link from "next/link";
import DevOutbox from "@/components/DevOutbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Check your email", robots: { index: false } };

export default function CheckEmailPage() {
  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">One more step</span>
        <h1>Check your email</h1>
        <p className="lede">We sent the next step to the address you gave us. Confirmation links work for 24 hours.</p>
      </div>
      <p>
        Nothing there? Check your spam folder, or <Link href="/login">log in</Link> with your new password to get a fresh
        link.
      </p>
      <DevOutbox />
    </div>
  );
}
