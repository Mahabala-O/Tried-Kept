"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import BallArt from "@/components/art/BallArt";
import BallRally from "@/components/BallRally";
import s from "@/components/games.module.css";
import { ProductImage } from "@/components/MediaFrame";
import { formatDate, GapNote, PriceSticker, SourceLink } from "@/components/ui";
import { runGearMatch, type GearMatchItem, type GearMatchState } from "@/lib/actions/game";
import { datedPrice, getProduct } from "@/lib/catalog";

type Option = { value: string; label: string; sub?: string; swatch?: "hard" | "clay" | "any" };

type Step = {
  id: "start" | "line" | "surface" | "budget" | "fit" | "cushioning";
  question: string;
  hint?: string;
  /** "grid" lays the options out as big number tiles. */
  layout?: "list" | "grid";
  options: Option[];
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
      { value: "hard", label: "Hard court", swatch: "hard" },
      { value: "clay", label: "Clay", swatch: "clay" },
      { value: "any", label: "Any surface", swatch: "any" },
    ],
  },
  {
    id: "budget",
    question: "What is the most you want to spend?",
    layout: "grid",
    options: [
      { value: "100", label: "$100", sub: "or less" },
      { value: "150", label: "$150", sub: "or less" },
      { value: "200", label: "$200", sub: "or less" },
      { value: "none", label: "No limit", sub: "Show it all" },
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

const LETTERS = ["A", "B", "C", "D", "E", "F"];

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

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="#FFF7E6" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * After a step change, bring the whole question card to the top of the screen (under the
 * sticky header), so the header band scrolls away and every option is in view. Then move
 * focus to the heading without a second jump.
 */
function showView(heading: HTMLElement | null) {
  if (!heading) return;
  const box = heading.closest<HTMLElement>("form, section") ?? heading;
  box.scrollIntoView({ block: "start" });
  heading.focus({ preventScroll: true });
}

export default function GearMatch({ resume = false }: { resume?: boolean }) {
  const [run, setRun] = useState(0);
  return <Round key={run} resume={resume && run === 0} onRestart={() => setRun((r) => r + 1)} />;
}

function Round({ resume, onRestart }: { resume: boolean; onRestart: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"none" | "next" | "back">("none");
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
      showView(headingRef.current);
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
      setDir("next");
      setStep(step + 1);
      return;
    }
    const formData = new FormData();
    for (const { id } of STEPS) formData.set(id, answers[id] ?? "");
    startTransition(() => action(formData));
  }

  return (
    <form className={`card ${s.panel} ${s.game}`} onSubmit={handleSubmit}>
      <div className="stack">
        <div className={s.progressHead}>
          <p className={s.progressText}>
            Question {step + 1} of {STEPS.length}
          </p>
          {isLast && <span className="sticker sticker-sm sticker-paper tilt-right">Last one</span>}
        </div>
        <BallRally states={STEPS.map((_, i) => (i < step ? "done" : i === step ? "current" : "todo"))} />
      </div>

      <div key={step} className={s.stepIn} data-dir={dir}>
        <fieldset className={s.fieldset}>
          <legend>
            <h2 ref={headingRef} tabIndex={-1} className={s.question}>
              {current.question}
            </h2>
          </legend>
          {current.hint && <p className="hint">{current.hint}</p>}
          <div className={s.options} data-layout={current.layout ?? "list"}>
            {current.options.map((option, index) => {
              const checked = answers[current.id] === option.value;
              const big = current.layout === "grid";
              return (
                <label key={option.value} className={big ? `${s.option} ${s.optionBig}` : s.option} data-checked={checked}>
                  <input
                    className={s.optionInput}
                    type="radio"
                    name={`gear-match-${current.id}`}
                    value={option.value}
                    checked={checked}
                    onChange={() => {
                      setAnswers({ ...answers, [current.id]: option.value });
                      setMissing(false);
                    }}
                  />
                  {!big &&
                    (option.swatch ? (
                      <span className={`${s.mark} ${s.swatch}`} data-swatch={option.swatch} aria-hidden="true" />
                    ) : (
                      <span className={s.mark} aria-hidden="true">
                        {LETTERS[index]}
                      </span>
                    ))}
                  <span className={s.optionLabel}>{option.label}</span>
                  {option.sub && <span className={s.optionSub}>{option.sub}</span>}
                  <span className={s.check} aria-hidden="true">
                    <CheckIcon />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

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

      <div className={s.actions}>
        <button
          type="button"
          className="btn"
          disabled={step === 0 || pending}
          onClick={() => {
            setMissing(false);
            setDir("back");
            setStep(step - 1);
          }}
        >
          Back
        </button>
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? (
            <>
              <BallArt className={s.spinBall} bounce />
              Finding matches
            </>
          ) : isLast ? (
            "See my matches"
          ) : (
            "Next"
          )}
        </button>
      </div>
    </form>
  );
}

function answerLabel(stepId: Step["id"], value: string | undefined): string | null {
  const step = STEPS.find((entry) => entry.id === stepId);
  const option = step?.options.find((o) => o.value === value);
  if (!option) return null;
  if (stepId === "budget") return value === "none" ? "No budget limit" : `Up to ${option.label}`;
  if (stepId === "fit") return value === "unsure" ? "Fit: not sure" : `${option.label} fit`;
  if (stepId === "cushioning") return value === "unsure" ? "Cushioning: not sure" : `${option.label} cushioning`;
  if (stepId === "line") return value === "any" ? "Either line" : option.label;
  return option.label;
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
  const recap = STEPS.filter((step) => step.id !== "start")
    .map((step) => answerLabel(step.id, answers[step.id]))
    .filter((label): label is string => label !== null);

  useEffect(() => {
    if (!state.loggedIn) saveAnswers(answers);
  }, [state.loggedIn, answers]);

  return (
    <section className={`stack-lg ${s.game}`}>
      <div className={`${s.resultsHead} ${s.rise}`}>
        <div className={s.resultsTitle}>
          <BallArt className={s.resultsBall} bounce={count > 0} />
          <h2 ref={headingRef} tabIndex={-1} className={s.question}>
            {count === 0 ? "No match yet" : count === 1 ? "1 match for your answers" : `${count} matches for your answers`}
          </h2>
        </div>
        {recap.length > 0 && (
          <ul className={s.recap} aria-label="Your answers">
            {recap.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}
        {count > 0 && (
          <p className="muted">Ranked only on facts we hold. Missing data earns no points and is labelled on each shoe.</p>
        )}
        {state.xpAwarded > 0 && (
          <p className="sticker sticker-xp sticker-plain sticker-wrap pop-in tilt-left">+{state.xpAwarded} XP for finishing Gear Match.</p>
        )}
        {state.loggedIn && state.xpAwarded === 0 && (
          <p className="small muted">Your Gear Match XP is already counted. Play as often as you like.</p>
        )}
      </div>

      {state.notes.map((note) => (
        <GapNote key={note}>{note}</GapNote>
      ))}

      {state.gap && (
        <div className={`card ${s.rise}`}>
          <h3>{state.gap.title}</h3>
          <GapNote>{state.gap.message}</GapNote>
          {state.gap.source && (
            <p className="small muted">
              Source: <SourceLink source={state.gap.source} />
            </p>
          )}
          <p className="small muted">Played in shoes that fit this? Your report could fill the gap for the next player.</p>
          <div className="cta-row">
            <Link href="/community" className="btn btn-primary">
              Go to the community
            </Link>
          </div>
        </div>
      )}

      {count > 0 && (
        <ol className={s.matchList}>
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
          <div className="cta-row">
            <Link href={`/signup?next=${RESUME_PATH}`} className="btn btn-primary">
              Join
            </Link>
            <Link href={`/login?next=${RESUME_PATH}`} className="btn">
              Log in
            </Link>
          </div>
        </div>
      )}

      <div className="cta-row">
        <button type="button" className="btn btn-optic" onClick={onRestart}>
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
  const product = getProduct(match.slug);
  const name = `${match.name}${match.line ? ` (${match.line})` : ""}`;

  return (
    <article className={`card ${s.match}`}>
      {product && (
        <div className={s.matchMedia}>
          <ProductImage product={product} />
          <span className={`sticker ${rank === 1 ? "sticker-xp" : "sticker-paper"} ${s.rank} tilt-right`} aria-hidden="true">
            {rank === 1 ? "Top match" : `#${rank}`}
          </span>
        </div>
      )}

      <div className={s.matchBody}>
        <div className={s.matchTitle}>
          <span className="eyebrow">
            Match {rank} · {match.brand}
          </span>
          <h3>{name}</h3>
          <div className={s.priceRow}>
            {product ? <PriceSticker product={product} /> : <span className="tag">{datedPrice(match)}</span>}
          </div>
        </div>

        {match.reasons.length > 0 && (
          <div className="stack">
            <p className={s.factHead}>Why it matched</p>
            <ul className={s.facts}>
              {match.reasons.map((reason) => (
                <li key={reason}>
                  <span className={`${s.factIcon} ${s.factYes}`} aria-hidden="true">
                    <svg viewBox="0 0 16 16" focusable="false">
                      <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="#0E2A2A" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.tradeoffs.length > 0 && (
          <div className="stack">
            <p className={s.factHead}>Differs from your answers</p>
            <ul className={s.facts}>
              {match.tradeoffs.map((note) => (
                <li key={note}>
                  <span className={`${s.factIcon} ${s.factDiff}`} aria-hidden="true">
                    !
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.unknowns.length > 0 && <GapNote>Not recorded yet: {match.unknowns.join(", ")}.</GapNote>}

        {match.offers.length > 0 ? (
          <div className="stack">
            <div className="cta-row">
              {match.offers.map((offer) => (
                <a key={offer.id} href={offer.href} className="btn btn-shop" target="_blank" rel="sponsored nofollow noopener">
                  Check price at {offer.retailer}
                  <span className="sr-only">
                    {" "}
                    for {match.brand} {name}
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

        <div className="cta-row">
          <Link href={`/gear/${match.slug}`} className="btn">
            View product
          </Link>
          {match.comparisons.map((comparison) => (
            <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="btn">
              {comparison.title}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
