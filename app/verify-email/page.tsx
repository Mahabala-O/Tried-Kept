import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/app/signup/_auth/AuthShell";
import { getDb } from "@/lib/db";
import { XP } from "@/lib/gamification";
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
    <AuthShell
      eyebrow="Join"
      title="Confirm your email"
      court="hardcourt"
      stickers={live ? <span className="sticker sticker-xp tilt-left">+{XP.signup} XP waiting</span> : undefined}
    >
      {live ? (
        <ConfirmEmailForm token={token} />
      ) : (
        <div className="stack">
          <span className="sticker sticker-returned sticker-sm tilt-left">Link expired</span>
          <p>
            This link has expired or was already used. <Link href="/login">Log in</Link> to get a new one.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
