import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeNext } from "@/app/me/_shared";
import { currentUser } from "@/lib/auth";
import { XP } from "@/lib/gamification";
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

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Join</span>
        <h1>Build your locker</h1>
        <p className="lede">
          List what you play in, log what you tried, and help the next player choose. You start with {XP.signup} XP.
        </p>
      </div>

      <SignupForm next={destination} />

      <p className="small muted">
        Public: your username, display name, bio, home surface, play level, level, XP and badges, your locker models
        with their status, size, width and hours, and your reports. Private: your email, weekly hours, the price you paid
        and your locker notes. <Link href="/privacy">Read how we handle your data</Link>.
      </p>
      <p>
        Already joined? <Link href={`/login?next=${encodeURIComponent(destination)}`}>Log in</Link>
      </p>
    </div>
  );
}
