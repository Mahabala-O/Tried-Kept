import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { tokenIsLive } from "@/lib/tokens";
import ConfirmEmailForm from "./ConfirmEmailForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false }, referrer: "no-referrer" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const live = typeof token === "string" && tokenIsLive(getDb(), token, "verify");

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Join</span>
        <h1>Confirm your email</h1>
      </div>
      {live ? (
        <ConfirmEmailForm token={token} />
      ) : (
        <p>
          This link has expired or was already used. <Link href="/login">Log in</Link> to get a new one.
        </p>
      )}
    </div>
  );
}
