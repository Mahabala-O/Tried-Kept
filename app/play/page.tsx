import type { Metadata } from "next";
import Link from "next/link";
import { XpBar } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { comparisons } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { levelFor, LEVELS, totalXp, XP } from "@/lib/gamification";
import { quizQuestions } from "@/lib/quiz";
import { HELPFUL_XP_VOTES_PER_AUTHOR } from "@/lib/reports";

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

export default async function PlayPage() {
  const user = await currentUser();
  const progress = user ? readProgress(user.id) : null;
  const level = progress?.level ?? null;

  return (
    <div className="wrap page">
      <header className="stack">
        <span className="eyebrow">Play</span>
        <h1>Learn the gear by playing</h1>
        <p className="lede">Three short games built on checked facts. Each one helps you decide what to try next.</p>
      </header>

      {level ? (
        <section className="card" aria-label="Your level">
          <div className="row between">
            <h2>{level.name}</h2>
            <span className="tag">{level.xp} XP</span>
          </div>
          <XpBar progress={level.progress} label={`Progress to ${level.next?.name ?? "top level"}`} />
          <p className="small muted">
            {level.next ? `${level.next.minXp - level.xp} XP to ${level.next.name}.` : "You have reached the top level."}
          </p>
        </section>
      ) : (
        <section className="callout">
          <p>Every game is free to play without an account.</p>
          <div className="row">
            <Link href="/signup" className="btn btn-primary">
              Join to keep your XP
            </Link>
            <Link href="/login" className="btn">
              Log in
            </Link>
          </div>
        </section>
      )}

      <section className="stack" aria-labelledby="games-heading">
        <h2 id="games-heading">Games</h2>
        <div className="grid">
          <Link href="/play/finder" className="card card-link">
            <span className="eyebrow">Find a shoe</span>
            <h3>Gear Match</h3>
            <p className="small muted">Answer six questions. See which shoes fit, why, and what we still do not know.</p>
            <div className="row">
              <span className="tag">{progress?.finderDone ? "Finished" : `${XP.finderComplete} XP`}</span>
            </div>
          </Link>
          <Link href="/play/rally" className="card card-link">
            <span className="eyebrow">Test your knowledge</span>
            <h3>Spec Rally</h3>
            <p className="small muted">
              {quizQuestions.length} questions on prices, specs and pro gear. Keep your streak alive.
            </p>
            <div className="row">
              <span className="tag">
                {progress
                  ? `${progress.quizRight} of ${quizQuestions.length} right`
                  : `${XP.quizCorrect} XP per question`}
              </span>
            </div>
          </Link>
          <Link href="/play/cost" className="card card-link">
            <span className="eyebrow">Run the numbers</span>
            <h3>Court Cost</h3>
            <p className="small muted">Compare two pairs by cost per hour and find the break-even point.</p>
            <div className="row">
              <span className="tag">No XP, just the math</span>
            </div>
          </Link>
        </div>
        {progress && (
          <p className="small muted">
            Comparisons worked through: {progress.scouted} of {comparisons.length}.{" "}
            <Link href="/compare">See comparisons</Link>
          </p>
        )}
      </section>

      <section className="stack" aria-labelledby="xp-heading">
        <h2 id="xp-heading">How XP works</h2>
        <p className="muted">
          XP rewards useful evidence. It never depends on a positive review or on clicking a retailer link.
        </p>
        <ul className="grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {XP_RULES.map((rule) => (
            <li key={rule.label} className="card">
              <span className="tag" style={{ justifySelf: "start" }}>
                {rule.points}
              </span>
              <strong>{rule.label}</strong>
              <span className="small muted">{rule.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack" aria-labelledby="levels-heading">
        <h2 id="levels-heading">Levels</h2>
        <ol className="grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {LEVELS.map((entry, index) => {
            const reached = level !== null && index <= level.index;
            const isCurrent = level !== null && index === level.index;
            return (
              <li key={entry.name} className={reached ? "badge badge-earned" : "badge"}>
                <strong>{entry.name}</strong>
                <span className="small">
                  {entry.minXp === 0 ? "Where everyone starts" : `From ${entry.minXp} XP`}
                  {isCurrent ? " · Your level" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
