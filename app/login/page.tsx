import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeNext } from "@/app/me/_shared";
import AuthShell from "@/app/signup/_auth/AuthShell";
import { currentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const destination = safeNext(next);

  if (await currentUser()) redirect(destination);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in"
      court="grass"
      lede="Your gear, shortlist and reports are right where you left them."
      perks={["Revisit the gear you want to try", "Update the hours on your gear", "Report what you kept or returned"]}
      below={
        <>
          <p>
            <Link href="/forgot-password" className="tap-link">
              Forgot your password?
            </Link>
          </p>
          <p>
            New here? <Link href={`/signup?next=${encodeURIComponent(destination)}`}>Create an account</Link>
          </p>
        </>
      }
    >
      <LoginForm next={destination} />
    </AuthShell>
  );
}
