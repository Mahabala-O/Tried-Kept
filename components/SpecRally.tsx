"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, type CSSProperties } from "react";
import { checkRallyAnswer } from "@/lib/actions/game";
import type { Source } from "@/lib/catalog";
import { SourceLink, XpBar } from "@/components/ui";

export type RallyQuestion = { id: string; prompt: string; options: string[] };

type Feedback = {
  picked: number;
  correct: boolean;
  answerIndex: number;
  explanation: string;
  source: Source | null;
  xpAwarded: number;
  alreadyCounted: boolean;
};

type Game = {
  round: number;
  index: number;
  score: number;
  streak: number;
  best: number;
  xpEarned: number;
  feedback: Feedback | null;
  finished: boolean;
  error: string | null;
};

const FRESH: Game = {
  round: 0,
  index: 0,
  score: 0,
  streak: 0,
  best: 0,
  xpEarned: 0,
  feedback: null,
  finished: false,
  error: null,
};

function optionStyle(index: number, feedback: Feedback | null): CSSProperties {
  const base: CSSProperties = { width: "100%", justifyContent: "flex-start", textAlign: "left" };
  if (!feedback) return base;
  if (index === feedback.answerIndex) {
    return { ...base, opacity: 1, background: "var(--mint)", borderColor: "var(--court)", color: "var(--court-deep)" };
  }
  if (index === feedback.picked) {
    return { ...base, opacity: 1, background: "var(--clay-soft)", borderColor: "var(--clay)", color: "var(--clay-deep)" };
  }
  return base;
}

export default function SpecRally({ questions, loggedIn }: { questions: RallyQuestion[]; loggedIn: boolean }) {
  const [game, act, pending] = useActionState(async (current: Game, formData: FormData): Promise<Game> => {
    const intent = formData.get("intent");

    if (intent === "replay") {
      return { ...FRESH, round: current.round + 1, best: current.best };
    }

    if (intent === "next") {
      if (!current.feedback) return current;
      const finished = current.index + 1 >= questions.length;
      return {
        ...current,
        feedback: null,
        error: null,
        finished,
        index: finished ? current.index : current.index + 1,
      };
    }

    const raw = formData.get("optionIndex");
    if (current.feedback || current.finished || typeof raw !== "string" || raw === "") return current;

    const picked = Number(raw);
    try {
      const result = await checkRallyAnswer(questions[current.index].id, picked);
      if (!result.ok) return { ...current, error: result.error };

      const streak = result.correct ? current.streak + 1 : 0;
      return {
        ...current,
        error: null,
        score: current.score + (result.correct ? 1 : 0),
        streak,
        best: Math.max(current.best, streak),
        xpEarned: current.xpEarned + result.xpAwarded,
        feedback: {
          picked,
          correct: result.correct,
          answerIndex: result.answerIndex,
          explanation: result.explanation,
          source: result.source,
          xpAwarded: result.xpAwarded,
          alreadyCounted: result.alreadyCounted,
        },
      };
    } catch {
      return { ...current, error: "We could not check that answer. Check your connection and try again." };
    }
  }, FRESH);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const viewKey = `${game.round}-${game.index}-${game.finished}`;
  const lastViewKey = useRef(viewKey);
  useEffect(() => {
    if (lastViewKey.current !== viewKey) {
      lastViewKey.current = viewKey;
      headingRef.current?.focus();
    }
  }, [viewKey]);

  useEffect(() => {
    if (game.feedback) nextRef.current?.focus();
  }, [game.feedback]);

  if (questions.length === 0) {
    return <p className="gap-note">No Spec Rally questions are available yet.</p>;
  }

  if (game.finished) {
    return (
      <form action={act} className="card">
        <span className="eyebrow">Final score</span>
        <h2 ref={headingRef} tabIndex={-1}>
          {game.score} of {questions.length} correct
        </h2>
        <div className="row">
          <span className="tag">Best streak {game.best}</span>
          {loggedIn && <span className="tag">+{game.xpEarned} XP this rally</span>}
        </div>
        {loggedIn && game.xpEarned === 0 && (
          <p className="small muted">XP pays once per question, so a replay only adds XP for questions you have not got right yet.</p>
        )}
        {!loggedIn && (
          <p className="small muted">
            <Link href={`/signup?next=${encodeURIComponent("/play/rally")}`}>Join</Link> to earn XP for each question you get right.
          </p>
        )}
        <div className="row">
          <button type="submit" name="intent" value="replay" className="btn btn-primary" disabled={pending}>
            Play again
          </button>
          <Link href="/play" className="btn">
            Back to games
          </Link>
        </div>
      </form>
    );
  }

  const question = questions[game.index];
  const feedback = game.feedback;
  const isLast = game.index + 1 >= questions.length;

  return (
    <form action={act} className="card">
      <div className="stack">
        <div className="row between">
          <p className="small muted">
            Question {game.index + 1} of {questions.length}
          </p>
          <div className="row">
            <span className="tag">Streak {game.streak}</span>
            <span className="tag">Best {game.best}</span>
          </div>
        </div>
        <XpBar progress={(game.index + (feedback ? 1 : 0)) / questions.length} label="Spec Rally progress" />
      </div>

      <h2 ref={headingRef} tabIndex={-1}>
        {question.prompt}
      </h2>

      <div className="stack">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="submit"
            name="optionIndex"
            value={index}
            className="btn"
            disabled={pending || feedback !== null}
            style={optionStyle(index, feedback)}
          >
            {option}
            {feedback && index === feedback.answerIndex ? " (correct answer)" : ""}
            {feedback && index === feedback.picked && !feedback.correct ? " (your pick)" : ""}
          </button>
        ))}
      </div>

      {game.error && (
        <p className="form-error" role="alert">
          {game.error}
        </p>
      )}

      <div aria-live="polite" className="stack">
        {feedback && (
          <>
            <p className={feedback.correct ? "form-ok" : "form-error"}>
              {feedback.correct ? "Correct." : "Not this time."}
              {feedback.xpAwarded > 0 ? ` +${feedback.xpAwarded} XP.` : ""}
              {feedback.alreadyCounted ? " XP for this question is already counted." : ""}
            </p>
            <p>{feedback.explanation}</p>
            {feedback.source && (
              <p className="small muted">
                Source: <SourceLink source={feedback.source} />
              </p>
            )}
          </>
        )}
      </div>

      {feedback && (
        <div className="row">
          <button ref={nextRef} type="submit" name="intent" value="next" className="btn btn-primary" disabled={pending}>
            {isLast ? "See final score" : "Next question"}
          </button>
        </div>
      )}
    </form>
  );
}
