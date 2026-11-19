"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { runGearMatch, type GearMatchItem, type GearMatchState } from "@/lib/actions/game";
import { formatDate, GapNote, SourceLink, XpBar } from "@/components/ui";
import { datedPrice } from "@/lib/catalog";

type Step = {
  id: "start" | "line" | "surface" | "budget" | "fit" | "cushioning";
  question: string;
  hint?: string;
  options: { value: string; label: string }[];
};

const STEPS: Step[] = [
  {
    id: "start",
    question: "Where are you starting from?",
    hint: "This only sets your next step. It does not change the ranking.",
    options: [
      { value: "pro", label: "A pro I follow" },
      { value: "product", label: "A product I am considering" },
      { value: "own-gear", label: "Gear I own" },
    ],
  },
  {
    id: "line",
    question: "Which line do you shop?",
    options: [
      { value: "mens", label: "Men's" },
      { value: "womens", label: "Women's" },
      { value: "any", label: "Either" },
    ],
  },
  {
    id: "surface",
    question: "Where do you play most?",
    options: [
      { value: "hard", label: "Hard court" },
      { value: "clay", label: "Clay" },
      { value: "any", label: "Any surface" },
    ],
  },
  {
    id: "budget",
    question: "What is the most you want to spend?",
    options: [
      { value: "100", label: "$100" },
      { value: "150", label: "$150" },
      { value: "200", label: "$200" },
      { value: "none", label: "No limit" },
    ],
  },
  {
    id: "fit",
    question: "How do you like a shoe to fit?",
    options: [
      { value: "roomy", label: "Roomy" },
      { value: "snug", label: "Snug" },
      { value: "wide", label: "Wide" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "cushioning",
    question: "Where do you want the cushioning?",
    options: [
      { value: "heel", label: "Heel" },
      { value: "forefoot", label: "Forefoot" },
      { value: "unsure", label: "Not sure" },
    ],
  },
];

const NEXT_STEP = {
  pro: { href: "/pros", label: "See dated pro gear" },
  product: { href: "/compare", label: "Compare products side by side" },
  "own-gear": { href: "/report/new", label: "Report on gear you own" },
} as const;

const IDLE: GearMatchState = { status: "idle" };

const SAVED_ANSWERS_KEY = "tk_gear_match_answers";
const SAVED_ANSWERS_MS = 86_400_000;
const RESUME_PATH = encodeURIComponent("/play/finder?resume=1");

/** Keeps a logged-out player's answers through signup, which can happen in a new tab. */
function saveAnswers(answers: Record<string, string>) {
  try {
    localStorage.setItem(SAVED_ANSWERS_KEY, JSON.stringify({ answers, savedAt: Date.now() }));
  } catch {
    // Storage can be blocked. The player can still answer the questions again.
  }
}

function takeSavedAnswers(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(SAVED_ANSWERS_KEY);
    localStorage.removeItem(SAVED_ANSWERS_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { answers?: Record<string, unknown>; savedAt?: number };
    if (typeof saved.savedAt !== "number" || Date.now() - saved.savedAt > SAVED_ANSWERS_MS) return null;
    const answers: Record<string, string> = {};
    for (const { id } of STEPS) {
      const value = saved.answers?.[id];
      if (typeof value !== "string") return null;
      answers[id] = value;
    }
    return answers;
  } catch {
    return null;
  }
}

export default function GearMatch({ resume = false }: { resume?: boolean }) {
  const [run, setRun] = useState(0);
  return <Round key={run} resume={resume && run === 0} onRestart={() => setRun((r) => r + 1)} />;
}

function Round({ resume, onRestart }: { resume: boolean; onRestart: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState(false);
  const [state, action, pending] = useActionState(async (prev: GearMatchState, formData: FormData) => {
    try {
      return await runGearMatch(prev, formData);
    } catch {
      return { status: "error", error: "We could not get your matches. Check your connection and try again." } as GearMatchState;
    }
  }, IDLE);

  // Coming back from signup or login: score the saved answers, and pay the XP this time.
  const resumed = useRef(false);
  useEffect(() => {
    if (!resume || resumed.current) return;
    resumed.current = true;
    const saved = takeSavedAnswers();
    if (!saved) return;
    setAnswers(saved);
    const formData = new FormData();
    for (const { id } of STEPS) formData.set(id, saved[id]);
    startTransition(() => action(formData));
  }, [resume, action]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const viewKey = state.status === "done" ? "done" : `step-${step}`;
  const lastViewKey = useRef(viewKey);
  useEffect(() => {
    if (lastViewKey.current !== viewKey) {
      lastViewKey.current = viewKey;
      headingRef.current?.focus();
    }
  }, [viewKey]);

  if (state.status === "done") {
    return <Results state={state} answers={answers} headingRef={headingRef} onRestart={onRestart} />;
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!answers[current.id]) {
      setMissing(true);
      return;
    }
    setMissing(false);
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    const formData = new FormData();
    for (const { id } of STEPS) formData.set(id, answers[id] ?? "");
    startTransition(() => action(formData));
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <div className="stack">
        <p className="small muted">
          Question {step + 1} of {STEPS.length}
        </p>
        <XpBar progress={(step + 1) / STEPS.length} label="Gear Match progress" />
      </div>

      <fieldset className="field">
        <legend>
          <h2 ref={headingRef} tabIndex={-1}>
            {current.question}
          </h2>
        </legend>
        {current.hint && <p className="hint">{current.hint}</p>}
        <div className="stack" style={{ marginTop: 12 }}>
          {current.options.map((option) => (
            <label key={option.value} className="choice">
              <input
                type="radio"
                name={`gear-match-${current.id}`}
                value={option.value}
                checked={answers[current.id] === option.value}
                onChange={() => {
                  setAnswers({ ...answers, [current.id]: option.value });
                  setMissing(false);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {missing && (
        <p className="form-error" role="alert">
          Choose one answer to continue.
        </p>
      )}
      {state.status === "error" && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="row between">
        <button
          type="button"
          className="btn"
          disabled={step === 0 || pending}
          onClick={() => {
            setMissing(false);
            setStep(step - 1);
          }}
        >
          Back
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Finding matches" : isLast ? "See my matches" : "Next"}
        </button>
      </div>
    </form>
  );
}

function Results({
  state,
  answers,
  headingRef,
  onRestart,
}: {
  state: Extract<GearMatchState, { status: "done" }>;
  answers: Record<string, string>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const next = NEXT_STEP[state.start];
  const count = state.matches.length;

  useEffect(() => {
    if (!state.loggedIn) saveAnswers(answers);
  }, [state.loggedIn, answers]);

  return (
    <section className="stack-lg">
      <div className="stack">
        <h2 ref={headingRef} tabIndex={-1}>
          {count === 0 ? "No match yet" : count === 1 ? "1 match for your answers" : `${count} matches for your answers`}
        </h2>
        {count > 0 && (
          <p className="muted">Ranked only on facts we hold. Missing data earns no points and is labelled on each shoe.</p>
        )}
        {state.xpAwarded > 0 && <p className="form-ok">+{state.xpAwarded} XP for finishing Gear Match.</p>}
        {state.loggedIn && state.xpAwarded === 0 && (
          <p className="small muted">Your Gear Match XP is already counted. Play as often as you like.</p>
        )}
      </div>

      {state.notes.map((note) => (
        <GapNote key={note}>{note}</GapNote>
      ))}

      {state.gap && (
        <div className="card">
          <h3>{state.gap.title}</h3>
          <GapNote>{state.gap.message}</GapNote>
          {state.gap.source && (
            <p className="small muted">
              Source: <SourceLink source={state.gap.source} />
            </p>
          )}
          <p className="small muted">Played in shoes that fit this? Your report could fill the gap for the next player.</p>
          <div className="row">
            <Link href="/community" className="btn btn-primary">
              Go to the community
            </Link>
          </div>
        </div>
      )}

      {count > 0 && (
        <ol className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {state.matches.map((match, index) => (
            <li key={match.slug}>
              <MatchCard match={match} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}

      {!state.loggedIn && (
        <div className="callout">
          <p>Join or log in to earn {state.xpAvailable} XP for finishing and to log what you try.</p>
          <span className="small">We keep these answers on this device for a day, so you will not have to redo them.</span>
          <div className="row">
            <Link href={`/signup?next=${RESUME_PATH}`} className="btn btn-primary">
              Join
            </Link>
            <Link href={`/login?next=${RESUME_PATH}`} className="btn">
              Log in
            </Link>
          </div>
        </div>
      )}

      <div className="row">
        <button type="button" className="btn" onClick={onRestart}>
          Start again
        </button>
        <Link href={next.href} className="btn">
          {next.label}
        </Link>
      </div>
    </section>
  );
}

function MatchCard({ match, rank }: { match: GearMatchItem; rank: number }) {
  return (
    <article className="card">
      <span className="eyebrow">
        Match {rank} · {match.brand}
      </span>
      <h3>
        {match.name}
        {match.line ? ` (${match.line})` : ""}
      </h3>
      <div className="row">
        <span className="tag">{datedPrice(match)}</span>
      </div>

      {match.reasons.length > 0 && (
        <div>
          <p className="small">
            <strong>Why it matched</strong>
          </p>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {match.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {match.tradeoffs.length > 0 && (
        <div>
          <p className="small">
            <strong>Differs from your answers</strong>
          </p>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {match.tradeoffs.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {match.unknowns.length > 0 && <GapNote>Not recorded yet: {match.unknowns.join(", ")}.</GapNote>}

      {match.offers.length > 0 ? (
        <div className="stack">
          <div className="row">
            {match.offers.map((offer) => (
              <a key={offer.id} href={offer.href} className="btn btn-shop" target="_blank" rel="sponsored nofollow noopener">
                Check price at {offer.retailer}
                <span className="sr-only">
                  {" "}
                  for {match.brand} {match.name}
                  {match.line ? ` (${match.line})` : ""}
                </span>
              </a>
            ))}
          </div>
          <p className="small muted">
            Link checked {formatDate(match.offers[0].checkedOn)}. Size availability is not confirmed.{" "}
            <Link href="/disclosure">We may earn a commission.</Link>
          </p>
        </div>
      ) : (
        <GapNote>No checked retailer link for this model yet.</GapNote>
      )}

      <div className="row">
        <Link href={`/gear/${match.slug}`} className="btn">
          View product
        </Link>
        {match.comparisons.map((comparison) => (
          <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="btn">
            {comparison.title}
          </Link>
        ))}
      </div>
    </article>
  );
}
