import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { tokenIsLive } from "@/lib/tokens";
import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const live = typeof token === "string" && tokenIsLive(getDb(), token, "reset");

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Account</span>
        <h1>Choose a new password</h1>
      </div>
      {live ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p>
          This link has expired or was already used. <Link href="/forgot-password">Ask for a new one</Link>.
        </p>
      )}
    </div>
  );
}
