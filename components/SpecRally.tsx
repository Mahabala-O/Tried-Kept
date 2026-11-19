"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, type CSSProperties } from "react";
import BallRally, { type RallyBallState } from "@/components/BallRally";
import s from "@/components/games.module.css";
import { SourceLink } from "@/components/ui";
import { checkRallyAnswer } from "@/lib/actions/game";
import type { Source } from "@/lib/catalog";

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
  /** Right or wrong for each question answered this round, for the ball rally. */
  results: boolean[];
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
  results: [],
  feedback: null,
  finished: false,
  error: null,
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const BURST = [0, 45, 90, 135, 180, 225, 270, 315];

function answerState(index: number, feedback: Feedback | null): "idle" | "correct" | "wrong" | "dim" {
  if (!feedback) return "idle";
  if (index === feedback.answerIndex) return "correct";
  if (index === feedback.picked) return "wrong";
  return "dim";
}

function rallyStates(game: Game, total: number): RallyBallState[] {
  return Array.from({ length: total }, (_, i) => {
    if (i < game.results.length) return game.results[i] ? "right" : "wrong";
    if (i === game.index && !game.finished) return "current";
    return "todo";
  });
}

function finalLine(score: number, total: number): string {
  if (score === total) return "A clean sweep. Every answer in.";
  if (score * 2 >= total) return "A solid rally. Replay to chase the ones that went out.";
  return "Every miss came with its source. Give them a read and go again.";
}

function Scoreboard({ game, total }: { game: Game; total: number }) {
  const shown = Math.min(game.index + 1, total);
  const hot = game.streak >= 2;
  return (
    <dl className={s.scoreboard} aria-label="Scoreboard">
      <div className={s.scoreCell}>
        <dt className={s.scoreLabel}>Question</dt>
        <dd className={s.scoreValue}>
          {shown}
          <small>/{total}</small>
        </dd>
      </div>
      <div className={s.scoreCell}>
        <dt className={s.scoreLabel}>Score</dt>
        <dd className={s.scoreValue}>{game.score}</dd>
      </div>
      <div key={hot ? `hot-${game.streak}` : "cold"} className={hot ? `${s.scoreCell} ${s.scoreHot}` : s.scoreCell}>
        <dt className={s.scoreLabel}>Streak</dt>
        <dd className={s.scoreValue}>{game.streak}</dd>
      </div>
      <div className={s.scoreCell}>
        <dt className={s.scoreLabel}>Best</dt>
        <dd className={s.scoreValue}>{game.best}</dd>
      </div>
    </dl>
  );
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
        results: [...current.results, result.correct],
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
      const heading = headingRef.current;
      if (heading) {
        // The heading's scroll margin clears the sticky header and the score strip.
        heading.scrollIntoView({ block: "start" });
        heading.focus({ preventScroll: true });
      }
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
      <form action={act} className={`card ${s.panel} ${s.final} ${s.game} ${s.rise}`}>
        <span className="eyebrow">Final score</span>
        <p className={s.bigScore} aria-hidden="true">
          {game.score}
          <span>/{questions.length}</span>
        </p>
        <h2 ref={headingRef} tabIndex={-1} className={`${s.prompt} ${s.finalTitle}`}>
          {game.score} of {questions.length} correct
        </h2>
        <p className="lede">{finalLine(game.score, questions.length)}</p>
        <BallRally states={rallyStates(game, questions.length)} />
        <div className="row">
          <span className="sticker sticker-paper sticker-plain tilt-left">Best streak {game.best}</span>
          {loggedIn && (
            <span className="sticker sticker-xp sticker-plain tilt-right pop-in">+{game.xpEarned} XP this rally</span>
          )}
        </div>
        {loggedIn && game.xpEarned === 0 && (
          <p className="small muted">XP pays once per question, so a replay only adds XP for questions you have not got right yet.</p>
        )}
        {!loggedIn && (
          <p className="small muted">
            <Link href={`/signup?next=${encodeURIComponent("/play/rally")}`}>Join</Link> to earn XP for each question you get right.
          </p>
        )}
        <div className="cta-row">
          <button type="submit" name="intent" value="replay" className="btn btn-optic btn-lg" disabled={pending}>
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
    <div className={s.game}>
      <Scoreboard game={game} total={questions.length} />

      <form action={act} className={`card ${s.panel}`}>
        <div className="stack">
          <p className={s.progressText}>
            Question {game.index + 1} of {questions.length}
          </p>
          <BallRally states={rallyStates(game, questions.length)} />
        </div>

        <div key={`${game.round}-${game.index}`} className={s.stepIn} data-dir={game.index === 0 && game.round === 0 ? "none" : "next"}>
          <h2 ref={headingRef} tabIndex={-1} className={s.prompt}>
            {question.prompt}
          </h2>
        </div>

        <ul className={s.answers}>
          {question.options.map((option, index) => {
            const state = answerState(index, feedback);
            return (
              <li key={option}>
                <button
                  type="submit"
                  name="optionIndex"
                  value={index}
                  className={s.answer}
                  data-state={state}
                  data-picked={feedback ? index === feedback.picked : undefined}
                  data-busy={pending && !feedback ? true : undefined}
                  disabled={pending || feedback !== null}
                >
                  <span className={s.mark} aria-hidden="true">
                    {LETTERS[index] ?? index + 1}
                  </span>
                  <span className={s.answerText}>{option}</span>
                  {state === "correct" && (
                    <span className={`sticker sticker-sm sticker-paper sticker-plain tilt-right ${s.answerTag}`}>
                      <span className="sr-only">, </span>Correct answer
                    </span>
                  )}
                  {state === "wrong" && (
                    <span className={`sticker sticker-sm sticker-paper sticker-plain tilt-left ${s.answerTag}`}>
                      <span className="sr-only">, </span>Your pick
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {game.error && (
          <p className="form-error" role="alert">
            {game.error}
          </p>
        )}

        <div aria-live="polite" className={s.feedback}>
          {feedback && (
            <>
              <div className={`${s.verdict} ${s.rise}`}>
                {feedback.correct && (
                  <span className={s.burst} aria-hidden="true">
                    {BURST.map((angle) => (
                      <i key={angle} style={{ "--a": `${angle}deg` } as CSSProperties} />
                    ))}
                  </span>
                )}
                <span
                  className={`sticker ${feedback.correct ? "sticker-kept pop-in" : `sticker-returned ${s.callWrong}`} ${s.callSticker} tilt-left`}
                  aria-hidden="true"
                >
                  {feedback.correct ? "In" : "Out"}
                </span>
                <p className={s.verdictText}>
                  {feedback.correct ? "Correct." : "Not this time."}
                  {feedback.xpAwarded > 0 && <span className="sr-only"> +{feedback.xpAwarded} XP.</span>}
                </p>
                {feedback.xpAwarded > 0 && (
                  <span className="sticker sticker-xp sticker-sm tilt-right pop-in" aria-hidden="true">
                    +{feedback.xpAwarded} XP
                  </span>
                )}
              </div>
              {feedback.alreadyCounted && <p className="small muted">XP for this question is already counted.</p>}
              <p className={s.explain}>{feedback.explanation}</p>
              {feedback.source && (
                <p className="small muted">
                  Source: <SourceLink source={feedback.source} />
                </p>
              )}
            </>
          )}
        </div>

        {feedback && (
          <div className="cta-row">
            <button ref={nextRef} type="submit" name="intent" value="next" className="btn btn-primary btn-lg" disabled={pending}>
              {isLast ? "See final score" : "Next question"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
