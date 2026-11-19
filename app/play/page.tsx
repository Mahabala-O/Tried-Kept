import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import BallArt from "@/components/art/BallArt";
import CourtArt from "@/components/art/CourtArt";
import { COLORS } from "@/components/art/palette";
import ShoeArt from "@/components/art/ShoeArt";
import { XpBar } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { comparisons } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { levelFor, LEVELS, totalXp, XP } from "@/lib/gamification";
import { quizQuestions } from "@/lib/quiz";
import { HELPFUL_XP_VOTES_PER_AUTHOR } from "@/lib/reports";
import s from "./play.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Play" };

const XP_RULES = [
  { label: "Finish Gear Match", points: `${XP.finderComplete} XP`, note: "Once" },
  { label: "Get a Spec Rally question right", points: `${XP.quizCorrect} XP`, note: "Once per question" },
  { label: "Work through a comparison", points: `${XP.comparisonScouted} XP`, note: "Once per comparison" },
  { label: "Join", points: `${XP.signup} XP`, note: "Once" },
  { label: "Complete your profile", points: `${XP.profileComplete} XP`, note: "Once" },
  { label: "Add an item to your locker", points: `${XP.lockerItem} XP`, note: "Per item" },
  {
    label: "Publish a tried-it report",
    points: `${XP.reportBase} XP`,
    note: `Plus ${XP.reportDetail} XP for each specific detail`,
  },
  {
    label: "Receive a helpful vote",
    points: `${XP.helpfulReceived} XP`,
    note: `Once per voter and model, and up to ${HELPFUL_XP_VOTES_PER_AUTHOR} times from one voter`,
  },
];

const TILTS = ["-5deg", "4deg", "-3deg", "6deg"];

function readProgress(userId: number) {
  const db = getDb();
  const rows = db.prepare("SELECT event_key FROM xp_events WHERE user_id = ?").all(userId) as { event_key: string }[];
  const keys = new Set(rows.map((row) => String(row.event_key)));
  return {
    level: levelFor(totalXp(db, userId)),
    finderDone: keys.has("finder:complete"),
    quizRight: quizQuestions.filter((q) => keys.has(`quiz:${q.id}`)).length,
    scouted: comparisons.filter((c) => keys.has(`compare:${c.slug}`)).length,
  };
}

type Progress = ReturnType<typeof readProgress>;

function GameCards({ progress }: { progress: Progress | null }) {
  const rallyAllRight = progress !== null && progress.quizRight === quizQuestions.length;
  return (
    <ul className={s.games}>
      <li>
        <article className={`card card-link ${s.gameCard}`}>
          <div className={`${s.gameArt} ${s.artHard} court-lines court-lines-art`}>
            <ShoeArt
              className={s.gameShoe}
              seed="play-gear-match"
              main={COLORS.paper}
              accent={COLORS.clay}
              detail={COLORS.hardcourt}
              base={COLORS.optic}
              lace={COLORS.ink}
            />
            <span className={`sticker ${progress?.finderDone ? "sticker-kept" : "sticker-xp"} ${s.gameSticker} tilt-right`}>
              {progress?.finderDone ? "Finished" : `+${XP.finderComplete} XP`}
            </span>
          </div>
          <div className={s.gameBody}>
            <span className="eyebrow">Find a shoe</span>
            <h3 className={s.gameTitle}>
              <Link href="/play/finder" className="stretched-link">
                Gear Match
              </Link>
            </h3>
            <p className="muted">Answer six questions. See which shoes fit, why, and what we still do not know.</p>
            <span className={`btn btn-primary ${s.fauxBtn}`} aria-hidden="true">
              Play Gear Match
            </span>
          </div>
        </article>
      </li>

      <li>
        <article className={`card card-link ${s.gameCard}`}>
          <div className={`${s.gameArt} ${s.artClay}`}>
            <BallArt className={s.gameBall} bounce />
            <span className={`sticker sticker-paper ${s.gameQ1} tilt-left`} aria-hidden="true">
              ?
            </span>
            <span className={`sticker sticker-blue ${s.gameQ2} tilt-right`} aria-hidden="true">
              ?
            </span>
            <span
              className={`sticker ${rallyAllRight ? "sticker-kept" : "sticker-xp"} sticker-plain ${s.gameSticker} tilt-right`}
            >
              {progress ? `${progress.quizRight} of ${quizQuestions.length} right` : `+${XP.quizCorrect} XP each`}
            </span>
          </div>
          <div className={s.gameBody}>
            <span className="eyebrow">Test your knowledge</span>
            <h3 className={s.gameTitle}>
              <Link href="/play/rally" className="stretched-link">
                Spec Rally
              </Link>
            </h3>
            <p className="muted">{quizQuestions.length} questions on prices, specs and pro gear. Keep your streak alive.</p>
            <span className={`btn btn-primary ${s.fauxBtn}`} aria-hidden="true">
              Play Spec Rally
            </span>
          </div>
        </article>
      </li>

      <li>
        <article className={`card card-link ${s.gameCard}`}>
          <div className={`${s.gameArt} ${s.artGrass}`}>
            <CourtArt variant="grass" className={s.gameCourt} />
            <span className={`sticker sticker-paper sticker-plain ${s.gameRate} tilt-left`} aria-hidden="true">
              $ per hour
            </span>
            <span className={`sticker sticker-paper sticker-plain ${s.gameSticker} tilt-right`}>No XP, just the math</span>
          </div>
          <div className={s.gameBody}>
            <span className="eyebrow">Run the numbers</span>
            <h3 className={s.gameTitle}>
              <Link href="/play/cost" className="stretched-link">
                Court Cost
              </Link>
            </h3>
            <p className="muted">Compare two pairs by cost per hour and find the break-even point.</p>
            <span className={`btn btn-primary ${s.fauxBtn}`} aria-hidden="true">
              Play Court Cost
            </span>
          </div>
        </article>
      </li>
    </ul>
  );
}

export default async function PlayPage() {
  const user = await currentUser();
  const progress = user ? readProgress(user.id) : null;
  const level = progress?.level ?? null;

  return (
    <>
      <section className={s.hero} aria-labelledby="play-title">
        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <span className="eyebrow">Play</span>
            <h1 id="play-title" className={s.heroTitle}>
              Learn the gear by <span className={s.heroWord}>playing</span>
            </h1>
            <p className="lede">Three short games built on checked facts. Each one helps you decide what to try next.</p>
          </div>

          <div className={s.heroSide}>
            <BallArt className={s.heroBall} bounce />
            {level ? (
              <section className={`card ${s.levelCard}`} aria-label="Your level">
                <div className="row between">
                  <span className="eyebrow">Your level</span>
                  <span className="sticker sticker-xp sticker-sm tilt-right">{level.xp} XP</span>
                </div>
                <h2 className={s.levelName}>{level.name}</h2>
                <XpBar progress={level.progress} label={`Progress to ${level.next?.name ?? "top level"}`} />
                <p className="small muted">
                  {level.next ? `${level.next.minXp - level.xp} XP to ${level.next.name}.` : "You have reached the top level."}
                </p>
              </section>
            ) : (
              <section className="callout" aria-label="Join">
                <p>Every game is free to play without an account.</p>
                <div className="cta-row">
                  <Link href="/signup" className="btn btn-primary">
                    Join to keep your XP
                  </Link>
                  <Link href="/login" className="btn">
                    Log in
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      <div className="wrap page">
        <section className="stack-lg" aria-labelledby="games-heading">
          <div className="stack">
            <h2 id="games-heading">Pick a game</h2>
          </div>
          <GameCards progress={progress} />
          {progress && (
            <p className="small muted">
              Comparisons worked through: {progress.scouted} of {comparisons.length}.{" "}
              <Link href="/compare">See comparisons</Link>
            </p>
          )}
        </section>

        <section className="stack-lg" aria-labelledby="xp-heading">
          <div className="stack">
            <h2 id="xp-heading">How XP works</h2>
            <p className="muted">XP rewards useful evidence. It never depends on a positive review or on clicking a retailer link.</p>
          </div>
          <ul className={s.rules}>
            {XP_RULES.map((rule, index) => (
              <li key={rule.label} className={`card ${s.rule}`}>
                <span
                  className={`sticker sticker-xp sticker-plain ${s.ruleSticker}`}
                  style={{ "--tilt": TILTS[index % TILTS.length] } as CSSProperties}
                >
                  {rule.points}
                </span>
                <span className={s.ruleText}>
                  <strong>{rule.label}</strong>
                  <span className="small muted">{rule.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="stack-lg" aria-labelledby="levels-heading">
          <h2 id="levels-heading">Levels</h2>
          <ol className={s.ladder}>
            {LEVELS.map((entry, index) => {
              const reached = level !== null && index <= level.index;
              const isCurrent = level !== null && index === level.index;
              return (
                <li key={entry.name} className={s.rung} data-reached={reached} data-current={isCurrent}>
                  <span className={s.rungBall} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className={s.rungText}>
                    <strong>{entry.name}</strong>
                    <span className="small">{entry.minXp === 0 ? "Where everyone starts" : `From ${entry.minXp} XP`}</span>
                  </span>
                  {isCurrent && <span className="sticker sticker-blue sticker-sm sticker-plain tilt-right">Your level</span>}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}
