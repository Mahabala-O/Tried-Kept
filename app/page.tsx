import Link from "next/link";
import type { CSSProperties } from "react";
import BallArt from "@/components/art/BallArt";
import PlayerArt from "@/components/art/PlayerArt";
import RacquetArt from "@/components/art/RacquetArt";
import ShoeArt from "@/components/art/ShoeArt";
import CountUp from "@/components/home/CountUp";
import GuessTheGear, { type GuessQuestion } from "@/components/home/GuessTheGear";
import s from "@/components/home/home.module.css";
import Ticker from "@/components/home/Ticker";
import MediaFrame, { ProImage, ProductImage } from "@/components/MediaFrame";
import { GapNote, PriceSticker, SourceLink, formatDate, productLabel } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getComparison, getPro, getProduct, retailers, type Product } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { LEVELS, XP, levelFor } from "@/lib/gamification";
import { mailReady } from "@/lib/mail";
import { homeMedia } from "@/lib/media";
import { quizQuestions } from "@/lib/quiz";
import { leaderboard } from "@/lib/reports";

export const dynamic = "force-dynamic";

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/* Data ------------------------------------------------------------------ */

type Pulse = { players: number; reports: number; kept: number; returned: number; testing: number };

function communityPulse(): Pulse {
  const db = getDb();
  const players = Number((db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n);
  const rows = db.prepare("SELECT outcome, COUNT(*) AS n FROM reports GROUP BY outcome").all() as unknown as {
    outcome: string;
    n: number;
  }[];
  const by = (o: string) => Number(rows.find((r) => r.outcome === o)?.n ?? 0);
  const kept = by("kept");
  const returned = by("returned") + by("rejected");
  const testing = by("testing");
  return { players, reports: kept + returned + testing, kept, returned, testing };
}

/** The pro spotlight further down already shows these answers, so the teaser skips them. */
const ANSWERED_ON_HOME = new Set(["alcaraz-shoe"]);

/** A sourced Spec Rally fact that changes each day. Worked examples are skipped. */
function questionOfTheDay(): GuessQuestion {
  const sourced = quizQuestions.filter((q) => q.source !== null && !ANSWERED_ON_HOME.has(q.id));
  const day = Math.floor(Date.now() / 86_400_000);
  const q = sourced[day % sourced.length];
  return { prompt: q.prompt, options: q.options, answerIndex: q.answerIndex, explanation: q.explanation, source: q.source };
}

/* Sections -------------------------------------------------------------- */

/** A fully detailed report: the base award plus the two details most players add. */
const SAMPLE_REPORT_XP = XP.reportBase + 2 * XP.reportDetail;

function Hero() {
  const gif = homeMedia.gifs[0];
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <BallArt className={s.heroBallDeco} />
      <div className={`wrap ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <span className="eyebrow">Tennis gear, tried for real</span>
          <h1 id="hero-title" className={s.heroTitle}>
            What&apos;s in your <span className={s.heroWord}>bag?</span>
          </h1>
          <p className={s.promise}>See what players tried, kept and sent back, then pick gear you will actually keep.</p>
          {/* How a report ends, shown as the stickers the site uses. Not tied to any person or picture. */}
          <ul className={s.heroStickers} aria-label="Every report ends in a verdict">
            <li>
              <span className={`sticker sticker-kept pop-in ${s.stickerA}`}>Kept</span>
            </li>
            <li>
              <span className={`sticker sticker-returned pop-in ${s.stickerB}`}>Sent back</span>
            </li>
            <li>
              <span className={`sticker sticker-xp pop-in ${s.stickerC}`}>+{SAMPLE_REPORT_XP} XP</span>
            </li>
          </ul>
          <div className="cta-row">
            <Link href="/play/finder" className="btn btn-optic btn-lg">
              Start Gear Match
            </Link>
            <Link href="/gear" className="btn btn-lg">
              Browse the gear
            </Link>
          </div>
          <p className="small muted">Gear Match is six quick taps, with the unknowns listed.</p>
        </div>

        <div className={s.heroVisual}>
          {gif ? (
            <MediaFrame gif={gif} fallback={null} ratio="1 / 1" eager className={s.heroMedia} />
          ) : (
            <div className={`${s.heroStage} court-lines court-lines-art`}>
              <PlayerArt bg="none" className={s.heroPlayer} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const TICKER = ["Tried it", "Kept it", "Sent it back", "Said why", "Logged the hours", "Helped the next player"];

function Doors({ loggedIn, signupsOpen }: { loggedIn: boolean; signupsOpen: boolean }) {
  const lockerHref = loggedIn ? "/me" : signupsOpen ? `/signup?next=${encodeURIComponent("/me")}` : `/login?next=${encodeURIComponent("/me")}`;
  return (
    <section className="wrap section" aria-labelledby="doors-title">
      <div className="stack">
        <span className="eyebrow">Pick a door</span>
        <h2 id="doors-title">Where do you want to start?</h2>
      </div>
      <div className={s.doors}>
        <Link href="/pros" className={`${s.door} ${s.doorPro} court-lines`}>
          <span className={s.doorTop}>
            <span className={s.doorKicker}>From a pro</span>
            <PlayerArt bg="none" animated={false} className={s.doorArt} />
          </span>
          <span className={s.doorTitle}>What does a pro wear?</span>
          <span className={s.doorText}>Dated gear with its source, then the retail model and a cheaper pick.</span>
          <span className={s.doorGo}>Browse pros</span>
        </Link>
        <Link href="/gear" className={`${s.door} ${s.doorProduct}`}>
          <span className={s.doorTop}>
            <span className={s.doorKicker}>From a product</span>
            <ShoeArt seed="door-product" variant={1} className={s.doorArt} />
          </span>
          <span className={s.doorTitle}>Found a model you like?</span>
          <span className={s.doorText}>Check its specs and sources, then read what players kept or returned.</span>
          <span className={s.doorGo}>Browse gear</span>
        </Link>
        <Link href={lockerHref} className={`${s.door} ${s.doorGear} court-lines`}>
          <span className={s.doorTop}>
            <span className={s.doorKicker}>From your gear</span>
            <RacquetArt seed="door-gear" tilt={24} className={s.doorArt} />
          </span>
          <span className={s.doorTitle}>Start with what you own</span>
          <span className={s.doorText}>
            {loggedIn
              ? "Add your gear to your locker and log what worked."
              : signupsOpen
                ? "List your gear in a locker of your own and log what worked. You will need an account for this one."
                : "Sign-ups are paused for now. If you already have an account, log in to open your locker."}
          </span>
          <span className={s.doorGo}>{loggedIn ? "Open your locker" : signupsOpen ? "Create your locker" : "Log in"}</span>
        </Link>
      </div>
    </section>
  );
}

function PriceQuestion() {
  const comparison = getComparison("vapor-12-vs-vapor-pro-3");
  if (!comparison) return null;
  const models = comparison.productSlugs.map((slug) => getProduct(slug)).filter((p): p is Product => p !== undefined);
  if (models.length !== 2) return null;
  const [a, b] = models;
  // Same rule as the comparison page: only state a gap when both prices were read the same day at the same retailer.
  const retailerA = a.offers[0]?.retailerId;
  const sameCheck =
    a.priceUsd !== null &&
    b.priceUsd !== null &&
    a.priceCheckedOn !== null &&
    a.priceCheckedOn === b.priceCheckedOn &&
    retailerA !== undefined &&
    retailerA === b.offers[0]?.retailerId;
  const gap = sameCheck ? Math.abs(a.priceUsd! - b.priceUsd!) : null;
  const checkedOn = a.priceCheckedOn;

  return (
    <section className="wrap section" aria-labelledby="price-question">
      <div className={s.vsIntro}>
        <span className="eyebrow">The {gap !== null ? `$${gap}` : "price"} question</span>
        <h2 id="price-question">{comparison.question}</h2>
      </div>
      <div className={s.vsCard}>
        <div className={s.vsProducts}>
          {models.map((p, i) => (
            <div key={p.slug} className={s.vsProduct}>
              <ProductImage product={p} ratio="1 / 1" />
              <p className={s.vsName}>
                <Link href={`/gear/${p.slug}`}>
                  <span className={s.vsBrand}>{p.brand}</span> {p.name}
                </Link>
              </p>
              <div className={s.vsPrice}>
                <PriceSticker product={p} tilt={i === 0 ? "tilt-left" : "tilt-right"} />
              </div>
            </div>
          ))}
          <span className={s.vsBadge} aria-hidden="true">
            VS
          </span>
        </div>

        {gap !== null && (
          <p className={s.gapLine}>
            <span className={`sticker sticker-returned sticker-lg ${s.gapSticker}`}>${gap}</span>
            <span>
              more for the {a.priceUsd! > b.priceUsd! ? a.name : b.name} on {retailers[retailerA!].name}&apos;s pages, checked{" "}
              {formatDate(checkedOn!)}.
            </span>
          </p>
        )}

        <dl className="vs-grid" aria-label={`${comparison.title}, side by side`}>
          <div className="vs-row vs-head">
            <dt className="vs-label">Model</dt>
            {models.map((p) => (
              <dd key={p.slug} className="vs-value">
                {p.name}
              </dd>
            ))}
          </div>
          {comparison.rows.map((row) => (
            <div key={row.label} className="vs-row">
              <dt className="vs-label">{row.label}</dt>
              {row.values.map((value, i) => (
                <dd key={models[i]?.slug ?? i} className="vs-value">
                  <span className="sr-only">{models[i]?.name}: </span>
                  {value}
                </dd>
              ))}
            </div>
          ))}
        </dl>
        {comparison.takeaway && (
          <div className="callout">
            <p>{comparison.takeaway}</p>
          </div>
        )}
        {comparison.gap && <GapNote>{comparison.gap}</GapNote>}
        <div className="cta-row">
          <Link href={`/compare/${comparison.slug}`} className="btn btn-primary btn-lg">
            See the full comparison
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProSpotlight() {
  const pro = getPro("carlos-alcaraz");
  if (!pro) return null;
  const shoe = pro.bag.find((item) => item.slot === "Shoes" && item.productSlug && item.identifiedOn);
  const product = shoe?.productSlug ? getProduct(shoe.productSlug) : undefined;

  return (
    <section className="band band-hardcourt court-lines" aria-labelledby="pro-title">
      <div className={`wrap ${s.spotGrid}`}>
        <div className={s.spotMedia}>
          <ProImage slug={pro.slug} prefer="gif" ratio="4 / 5" artBg="#E6FF3D" note="Shows the player, not the gear in the card." />
          <span className={`sticker sticker-ink ${s.spotSticker}`} style={{ "--tilt": "-6deg" } as CSSProperties}>
            Pro spotlight
          </span>
        </div>
        <div className="stack-lg">
          <div className="stack">
            <span className="eyebrow">In a pro&apos;s bag</span>
            <h2 id="pro-title" className={s.spotName}>
              {pro.name}
            </h2>
          </div>
          {shoe && product && shoe.identifiedOn ? (
            <div className="card">
              <div className={s.shoeItem}>
                <ProductImage product={product} ratio="1 / 1" />
                <div className="stack">
                  <span className="sticker sticker-blue sticker-sm sticker-plain sticker-wrap tilt-left">
                    {shoe.slot} dated {formatDate(shoe.identifiedOn)}
                  </span>
                  <h3>
                    <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>
                  </h3>
                </div>
              </div>
              <p className="small">{shoe.evidence}</p>
              <SourceLink source={shoe.source} standalone />
              <GapNote>{pro.caveat}</GapNote>
            </div>
          ) : (
            <GapNote>No dated gear identification has been recorded yet.</GapNote>
          )}
          <div className="cta-row">
            <Link href={`/pros/${pro.slug}`} className="btn btn-optic btn-lg">
              See his bag
            </Link>
            <Link href="/pros" className="btn">
              All pros
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityPulse({ pulse, loggedIn, signupsOpen }: { pulse: Pulse; loggedIn: boolean; signupsOpen: boolean }) {
  const top = leaderboard(3);
  const pct = (n: number) => (pulse.reports > 0 ? Math.round((n / pulse.reports) * 100) : 0);
  const stats = [
    { value: pulse.players, label: plural(pulse.players, "player joined", "players joined"), tone: s.statOptic },
    { value: pulse.reports, label: plural(pulse.reports, "report filed", "reports filed"), tone: s.statPaper },
    { value: pulse.kept, label: "kept", tone: s.statGrass },
    { value: pulse.returned, label: "returned or rejected", tone: s.statClay },
  ];

  return (
    <section className="wrap section" aria-labelledby="pulse-title">
      <div className={s.pulseHead}>
        <div className="stack">
          <span className="eyebrow">Community pulse</span>
          <h2 id="pulse-title">Counted from real reports</h2>
        </div>
        <p className="muted">Straight from the database, every time this page loads. No padding, no made-up numbers.</p>
      </div>

      {pulse.reports > 0 && (
        <ul className={s.pulseGrid}>
          {stats.map((stat) => (
            <li key={stat.label} className={`${s.stat} ${stat.tone}`}>
              <CountUp value={stat.value} className={s.statNum} />
              <span className={s.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
      )}

      {pulse.reports > 0 ? (
        <div className="stack">
          <div className={s.splitBar} role="img" aria-label={`${pct(pulse.kept)}% kept, ${pct(pulse.returned)}% returned or rejected, ${pct(pulse.testing)}% still testing`}>
            {pulse.kept > 0 && <span className={s.splitKept} style={{ flexGrow: pulse.kept }} />}
            {pulse.returned > 0 && <span className={s.splitReturned} style={{ flexGrow: pulse.returned }} />}
            {pulse.testing > 0 && <span className={s.splitTesting} style={{ flexGrow: pulse.testing }} />}
          </div>
          <div className="row">
            <span className="tag tag-kept">Kept {pct(pulse.kept)}%</span>
            <span className="tag tag-returned">Returned or rejected {pct(pulse.returned)}%</span>
            {pulse.testing > 0 && <span className="tag tag-testing">Still testing {pct(pulse.testing)}%</span>}
          </div>
        </div>
      ) : (
        <div className={s.emptyPulse}>
          <BallArt bounce className={s.emptyBall} />
          <div className="stack">
            <span className="sticker sticker-ink sticker-sm tilt-left">Report #1 is open</span>
            <h3 className={s.emptyTitle}>Be the first to report</h3>
            <p>
              No one has filed a report yet
              {pulse.players > 0 ? `, though ${pulse.players} ${plural(pulse.players, "player has", "players have")} joined` : ""}. Yours
              would be the first one the next player reads, and kept or returned pays the same XP.
            </p>
          </div>
          <div className="cta-row">
            <Link href="/report/new" className="btn btn-primary btn-lg">
              Report your gear
            </Link>
            {!loggedIn && !signupsOpen && (
              <Link href="/login" className="btn">
                Log in first
              </Link>
            )}
          </div>
        </div>
      )}

      {top.length > 0 && (
        <div className="stack">
          <h3>Top of the ladder</h3>
          <ol className={s.board}>
            {top.map((entry, i) => (
              <li key={entry.id} className={s.boardItem}>
                <span className={`${s.rank} ${i === 0 ? s.rankFirst : ""}`} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={s.boardWho}>
                  <Link href={`/u/${entry.username}`}>{entry.display_name}</Link>
                  <span className="small muted"> {levelFor(entry.xp).name}</span>
                </span>
                <span className="sticker sticker-xp sticker-sm sticker-plain tilt-none">{entry.xp} XP</span>
              </li>
            ))}
          </ol>
          <Link href="/community" className="tap-link">
            See every report and the full ladder
          </Link>
        </div>
      )}
    </section>
  );
}

const RALLY = [
  { xp: `+${XP.signup}`, title: "Join", text: "Make an account and confirm your email." },
  { xp: `+${XP.profileComplete}`, title: "Fill in your profile", text: "Add a bio, your surface, level and weekly hours, so others can read your reports in context." },
  { xp: `+${XP.lockerItem}`, title: "Stock your locker", text: "For each model you add." },
  { xp: `+${XP.reportBase}`, title: "Report what you tried", text: `Plus ${XP.reportDetail} for each useful detail, like size, surface or hours. Kept or returned pays the same.` },
  { xp: `+${XP.helpfulReceived}`, title: "Help someone choose", text: "When another player marks your report helpful." },
  { xp: `+${XP.finderComplete}`, title: "Play the games", text: `Finish Gear Match, and get ${XP.quizCorrect} for each Spec Rally answer you get right.` },
];

function XpRally({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="band band-cream" aria-labelledby="xp-title">
      <div className="wrap stack-lg">
        <div className="stack">
          <span className="eyebrow">How XP works</span>
          <h2 id="xp-title">Rally your way up</h2>
          <p className="lede">Points pay for useful detail. They never depend on a positive review or on buying anything.</p>
        </div>
        <ol className={s.rally}>
          {RALLY.map((step, i) => (
            <li key={step.title} className={s.rallyStep} style={{ "--step": i } as CSSProperties}>
              <span className={s.rallyBall} aria-hidden="true">
                <BallArt />
              </span>
              <div className={s.rallyCard}>
                <span className={`sticker sticker-xp sticker-sm sticker-plain ${i % 2 ? "tilt-right" : "tilt-left"}`}>{step.xp} XP</span>
                <h3>{step.title}</h3>
                <p className="small muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="stack">
          <h3>Levels</h3>
          <ol className={`chip-scroll ${s.levels}`} aria-label="Levels and the XP each one needs" tabIndex={0}>
            {LEVELS.map((level, i) => (
              <li key={level.name} className={s.levelChip}>
                <span className={s.levelNum}>{i + 1}</span>
                {level.name}
                <span className="muted">{level.minXp} XP</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="chip-scroll" aria-label="Games">
          <Link href="/play/finder" className="chip">
            Gear Match
          </Link>
          <Link href="/play/rally" className="chip">
            Spec Rally
          </Link>
          <Link href="/play/cost" className="chip">
            Cost per hour
          </Link>
          <Link href={loggedIn ? "/me" : "/play"} className="chip">
            {loggedIn ? "Your badges" : "See all of Play"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function JoinCta({ loggedIn, signupsOpen }: { loggedIn: boolean; signupsOpen: boolean }) {
  return (
    <section className={`band band-ink ${s.join}`} aria-labelledby="join-title">
      <div className={`wrap ${s.joinGrid}`}>
        <div className="stack-lg">
          <h2 id="join-title" className={s.joinTitle}>
            Kept it? Sent it back? <span className={s.joinPop}>Say why.</span>
          </h2>
          <p className="lede">One honest report can save the next player a return trip.</p>
          <div className="cta-row">
            {loggedIn ? (
              <Link href="/report/new" className="btn btn-optic btn-lg">
                Report your gear
              </Link>
            ) : signupsOpen ? (
              <>
                <Link href="/signup" className="btn btn-optic btn-lg">
                  Join and start a locker
                </Link>
                <Link href="/login" className="btn btn-lg">
                  Log in
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-optic btn-lg">
                  Log in
                </Link>
                <Link href="/gear" className="btn btn-lg">
                  Browse the gear
                </Link>
              </>
            )}
          </div>
          {!loggedIn && !signupsOpen && <p className="small">New sign-ups are paused for now.</p>}
        </div>
        <BallArt bounce className={s.joinBall} />
      </div>
    </section>
  );
}

/** General tour moments from lib/media.ts. Every one is credited, and none is tied to a product. */
function Moments() {
  const clips = homeMedia.gifs.slice(1);
  const photos = homeMedia.photos;
  if (clips.length === 0 && photos.length === 0) return null;
  // Alternate clips and photos so the rail keeps changing pace.
  const items: ({ kind: "gif"; gif: (typeof clips)[number] } | { kind: "photo"; photo: (typeof photos)[number] })[] = [];
  for (let i = 0; i < Math.max(clips.length, photos.length); i++) {
    if (photos[i]) items.push({ kind: "photo", photo: photos[i] });
    if (clips[i]) items.push({ kind: "gif", gif: clips[i] });
  }
  return (
    <section className={`band band-ink ${s.moments}`} aria-labelledby="moments-title">
      <div className="wrap stack-lg">
        <div className={s.momentsHead}>
          <div className="stack">
            <span className="eyebrow">On court</span>
            <h2 id="moments-title">
              Why we <span className={s.joinPop}>care</span> what&apos;s on your feet
            </h2>
          </div>
          <p className="muted">Moments from the tour and the stands. They show players and fans, not any gear on this site.</p>
        </div>
        <ul className={s.momentRail} aria-label="Tennis moments, swipe for more" tabIndex={0}>
          {items.map((item, i) => (
            <li key={item.kind === "gif" ? item.gif.id : item.photo.src} className={s.moment} data-tilt={i % 3}>
              {item.kind === "gif" ? (
                <MediaFrame gif={item.gif} fallback={null} ratio="4 / 5" />
              ) : (
                <MediaFrame photo={item.photo} fallback={null} ratio="4 / 5" sizes="(min-width: 900px) 300px, 78vw" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Page ------------------------------------------------------------------ */

export default async function HomePage() {
  const user = await currentUser();
  const loggedIn = Boolean(user);
  const signupsOpen = mailReady();
  const pulse = communityPulse();

  return (
    <>
      <Hero />
      <Ticker words={TICKER} />
      <Doors loggedIn={loggedIn} signupsOpen={signupsOpen} />
      <section className="band band-optic" aria-label="Guess the gear">
        <div className="wrap">
          <GuessTheGear question={questionOfTheDay()} />
        </div>
      </section>
      <PriceQuestion />
      <Moments />
      <ProSpotlight />
      <CommunityPulse pulse={pulse} loggedIn={loggedIn} signupsOpen={signupsOpen} />
      <XpRally loggedIn={loggedIn} />
      <JoinCta loggedIn={loggedIn} signupsOpen={signupsOpen} />
    </>
  );
}
