import type { Metadata } from "next";
import Link from "next/link";
import SpecRally, { type RallyQuestion } from "@/components/SpecRally";
import { currentUser } from "@/lib/auth";
import { quizQuestions } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spec Rally",
  description: "Answer one question at a time on tennis gear prices, specs and pro evidence.",
};

export default async function SpecRallyPage() {
  const user = await currentUser();

  // Answers stay on the server. Only these three fields reach the browser.
  const questions: RallyQuestion[] = quizQuestions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: [...q.options],
  }));

  return (
    <div className="wrap page">
      <header className="stack">
        <Link href="/play" className="small tap-link">
          Back to games
        </Link>
        <h1>Spec Rally</h1>
        <p className="lede">One question at a time. Every fact comes with its source.</p>
      </header>
      <SpecRally questions={questions} loggedIn={user !== null} />
    </div>
  );
}
