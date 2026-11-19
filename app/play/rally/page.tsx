import type { Metadata } from "next";
import BallArt from "@/components/art/BallArt";
import SpecRally, { type RallyQuestion } from "@/components/SpecRally";
import { currentUser } from "@/lib/auth";
import { quizQuestions } from "@/lib/quiz";
import GameHeader from "../GameHeader";

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
    <>
      <GameHeader
        title="Spec Rally"
        lede="One question at a time. Every fact comes with its source."
        tone="clay"
        art={<BallArt bounce />}
      />
      <div className="wrap page">
        <SpecRally questions={questions} loggedIn={user !== null} />
      </div>
    </>
  );
}
