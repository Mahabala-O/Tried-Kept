"use client";

import Link from "next/link";
import { useId, useState } from "react";
import s from "./home.module.css";

export type GuessQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  source: { label: string; url: string } | null;
};

const CONFETTI = Array.from({ length: 14 }, (_, i) => i);

/** One Spec Rally fact as a tap-to-reveal teaser. Nothing is saved and no XP is awarded here. */
export default function GuessTheGear({ question }: { question: GuessQuestion }) {
  const [picked, setPicked] = useState<number | null>(null);
  const headingId = useId();
  const revealed = picked !== null;
  const correct = picked === question.answerIndex;
  const answer = question.options[question.answerIndex];

  return (
    <div className={s.guess} aria-labelledby={headingId} role="group">
      <div className={s.guessHead}>
        <span className="eyebrow">Guess the gear</span>
        <span className="sticker sticker-ink sticker-sm tilt-right">Quick one</span>
      </div>
      <h2 id={headingId} className={s.guessPrompt}>
        {question.prompt}
      </h2>
      <div className={s.options}>
        {question.options.map((option, i) => {
          const state = !revealed ? "" : i === question.answerIndex ? s.optionRight : i === picked ? s.optionWrong : s.optionDim;
          return (
            <button
              key={option}
              type="button"
              className={`${s.option} ${state}`}
              aria-pressed={picked === i}
              aria-disabled={revealed && picked !== i ? true : undefined}
              onClick={() => {
                if (!revealed) setPicked(i);
              }}
            >
              <span className={s.optionLetter} aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{option}</span>
              {revealed && i === question.answerIndex && (
                <span className={`sticker sticker-kept sticker-sm ${s.optionTag}`}>Right</span>
              )}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className={s.revealSlot}>
        {revealed && (
          <div className={`${s.reveal} pop-in`}>
            {correct && (
              <div className={s.confetti} aria-hidden="true">
                {CONFETTI.map((i) => (
                  <span key={i} className={s.confettiPiece} style={{ "--i": i } as React.CSSProperties} />
                ))}
              </div>
            )}
            <p className={s.revealTitle}>{correct ? "Ace! That is right." : `Out! It was ${answer}.`}</p>
            <p>{question.explanation}</p>
            {question.source && (
              <a href={question.source.url} target="_blank" rel="noopener noreferrer" className="small tap-link">
                Source: {question.source.label}
              </a>
            )}
            <div className="cta-row">
              <Link href="/play/rally" className="btn btn-primary">
                Play the full Spec Rally
              </Link>
              <Link href="/play/finder" className="btn">
                Try Gear Match
              </Link>
            </div>
          </div>
        )}
      </div>
      {!revealed && <p className="small muted">Tap an answer to see if you are right. Just for fun, no points here.</p>}
    </div>
  );
}
