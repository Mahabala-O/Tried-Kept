import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeNext } from "@/app/me/_shared";
import { currentUser } from "@/lib/auth";
import { LEVELS, XP } from "@/lib/gamification";
import { mailReady } from "@/lib/mail";
import AuthShell from "./_auth/AuthShell";
import MailPausedNotice from "./_auth/MailPausedNotice";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join",
  description: "Create a profile, list the gear you use and share what you tried, kept or returned.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const destination = safeNext(next);

  if (await currentUser()) redirect(destination);

  // The server action checks this too. Here it stops people filling a form that cannot work.
  const paused = !mailReady();

  return (
    <AuthShell
      eyebrow="Join"
      title="Build your locker"
      court="hardcourt"
      lede="List what you play in, log what you tried, and help the next player choose."
      stickers={
        <>
          <span className="sticker sticker-xp tilt-left">+{XP.signup} XP to start</span>
          <span className="sticker sticker-paper sticker-sm tilt-right">{LEVELS[0].name}</span>
        </>
      }
      perks={[
        "A public locker of the shoes and racquets you use",
        "Badges for honest reports, returns included",
        `${LEVELS.length} levels, from ${LEVELS[0].name} to ${LEVELS[LEVELS.length - 1].name}`,
      ]}
      notice={paused ? <MailPausedNotice kind="signup" /> : undefined}
      below={
        <>
          <p>
            Already joined? <Link href={`/login?next=${encodeURIComponent(destination)}`}>Log in</Link>
          </p>
          <p className="muted">
            Public: your username, display name, bio, home surface, play level, level, XP and badges, your locker models
            with their status, size, width and hours, and your reports. Private: your email, weekly hours, the price you
            paid and your locker notes. <Link href="/privacy">Read how we handle your data</Link>.
          </p>
        </>
      }
    >
      <SignupForm next={destination} paused={paused} />
    </AuthShell>
  );
}
