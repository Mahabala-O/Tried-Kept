import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeNext } from "@/app/me/_shared";
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
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in</h1>
      </div>

      <LoginForm next={destination} />

      <p>
        <Link href="/forgot-password" className="tap-link">
          Forgot your password?
        </Link>
      </p>
      <p>
        New here? <Link href={`/signup?next=${encodeURIComponent(destination)}`}>Create an account</Link>
      </p>
    </div>
  );
}
