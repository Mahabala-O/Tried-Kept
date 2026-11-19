import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/app/signup/_auth/AuthShell";
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
    <AuthShell
      eyebrow="Account"
      title="Choose a new password"
      court="clay"
      lede={live ? "Almost there. Pick a new one and you are back on court." : undefined}
    >
      {live ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="stack">
          <span className="sticker sticker-returned sticker-sm tilt-left">Link expired</span>
          <p>
            This link has expired or was already used. <Link href="/forgot-password">Ask for a new one</Link>.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
