"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createReport } from "@/lib/actions/reports";
import type { Category } from "@/lib/catalog";
import { reportXp, type ReportDetails } from "@/lib/gamification";
import type { ReportActionState } from "@/lib/reports";
import styles from "./ReportForm.module.css";

export type ProductOption = { slug: string; label: string; category: Category };
type Option = { value: string; label: string };
type Limits = {
  size: number;
  width: number;
  wear: number;
  stringSetup: number;
  feltDifferent: number;
  reason: number;
  hours: number;
};

type Props = {
  products: ProductOption[];
  outcomes: readonly Option[];
  surfaces: readonly Option[];
  limits: Limits;
  initialProduct: string;
  /** Models this player has already earned report XP for. */
  rewardedSlugs: string[];
  /** Server-rendered thumbnails by product slug: the exact model's photo or labeled art. */
  previews?: Record<string, ReactNode>;
};

const INITIAL: ReportActionState = {};
const GROUPS: { category: Category; label: string }[] = [
  { category: "shoe", label: "Shoes" },
  { category: "racquet", label: "Racquets" },
];

/** A short line under each outcome tile. */
const OUTCOME_NOTES: Record<string, string> = {
  kept: "Still in my bag",
  returned: "Sent it back",
  rejected: "Tried it, passed",
  testing: "Too soon to say",
};

/**
 * Sample values that earn every detail, used only to ask reportXp how much each field
 * can be worth. The real estimate always comes from what the player typed.
 */
const FULL_DETAIL: Required<Omit<ReportDetails, "category">> = {
  size: "10",
  width: "wide",
  surface: "hard",
  hours: 0,
  felt_different: "a full sentence about the feel",
  reason: "a full sentence about the reason",
  wear_location: "toe box",
  string_setup: "poly 17 at 52 lbs",
  switched_from_slug: "x",
};
type DetailKey = keyof typeof FULL_DETAIL;

/** Ticks a shown number toward its target. Jumps straight there under reduced motion. */
function useTicker(target: number): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 450;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      shownRef.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}

function XpTag({ points, earned, hidden }: { points: number; earned: boolean; hidden: boolean }) {
  if (hidden || points <= 0) return null;
  return (
    <span className={`${styles.xpTag} ${earned ? styles.xpTagOn : ""}`} aria-hidden="true">
      {earned ? "✓ " : ""}+{points} XP
    </span>
  );
}

function ComfortBall() {
  return (
    <svg viewBox="0 0 24 24" className={styles.comfortBall} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="#E6FF3D" stroke="#0E2A2A" strokeWidth="2" />
      <path d="M5 5.5c3.2 3.6 3.2 9.4 0 13M19 5.5c-3.2 3.6-3.2 9.4 0 13" fill="none" stroke="#0E2A2A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ReportForm({
  products,
  outcomes,
  surfaces,
  limits,
  initialProduct,
  rewardedSlugs,
  previews = {},
}: Props) {
  const [state, formAction, pending] = useActionState(createReport, INITIAL);

  const [product, setProduct] = useState(initialProduct);
  const [switchedFrom, setSwitchedFrom] = useState("");
  const [outcome, setOutcome] = useState("");
  const [comfort, setComfort] = useState("");
  const [size, setSize] = useState("");
  const [width, setWidth] = useState("");
  const [surface, setSurface] = useState("");
  const [hours, setHours] = useState("");
  const [feltDifferent, setFeltDifferent] = useState("");
  const [reason, setReason] = useState("");
  const [wear, setWear] = useState("");
  const [stringSetup, setStringSetup] = useState("");

  const selected = products.find((p) => p.slug === product);
  const isShoe = selected?.category === "shoe";
  const isRacquet = selected?.category === "racquet";
  const switchOptions = selected
    ? products.filter((p) => p.category === selected.category && p.slug !== selected.slug)
    : [];

  function chooseProduct(slug: string) {
    setProduct(slug);
    const next = products.find((p) => p.slug === slug);
    const previous = products.find((p) => p.slug === switchedFrom);
    if (!next || !previous || previous.slug === next.slug || previous.category !== next.category) {
      setSwitchedFrom("");
    }
  }

  // Submitting by hand keeps the player's answers on screen if the server rejects them.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  const hoursValue = hours.trim() === "" || Number.isNaN(Number(hours)) ? null : Number(hours);
  const details: Required<Omit<ReportDetails, "category">> = {
    size: size.trim(),
    width: width.trim(),
    surface,
    hours: hoursValue,
    felt_different: feltDifferent.trim(),
    reason: reason.trim(),
    wear_location: isShoe ? wear.trim() : "",
    string_setup: isRacquet ? stringSetup.trim() : "",
    switched_from_slug: switchedFrom || null,
  };
  const category = selected?.category;
  const estimate = reportXp({ category, ...details });
  const base = reportXp({ category });
  const maxXp = reportXp({ category, ...FULL_DETAIL });
  const alreadyRewarded = rewardedSlugs.includes(product);

  /** What one field is worth and whether the player's answer already earns it, both asked of reportXp. */
  const worth = (key: DetailKey) => ({
    points: reportXp({ category, [key]: FULL_DETAIL[key] }) - base,
    earned: reportXp({ category, [key]: details[key] }) > base,
  });
  const xp = {
    size: worth("size"),
    width: worth("width"),
    surface: worth("surface"),
    hours: worth("hours"),
    felt: worth("felt_different"),
    reason: worth("reason"),
    wear: worth("wear_location"),
    strings: worth("string_setup"),
    switched: worth("switched_from_slug"),
  };
  const detailsGiven =
    comfort !== "" ||
    [xp.felt, xp.size, xp.width, xp.surface, xp.hours, xp.wear, xp.strings].some((v) => v.earned);

  const shownTarget = alreadyRewarded ? 0 : estimate;
  const shown = useTicker(shownTarget);
  const fill = maxXp > 0 ? Math.max(0, Math.min(1, shownTarget / maxXp)) : 0;

  const steps = [
    { id: "step-gear", label: "Gear", done: Boolean(selected) },
    { id: "step-verdict", label: "Verdict", done: Boolean(outcome) && reason.trim() !== "" },
    { id: "step-details", label: "Details", done: detailsGiven },
  ];

  return (
    <form action={formAction} onSubmit={submit} className={styles.form}>
      <nav className={styles.steps} aria-label="Report sections">
        <ol className="chip-scroll">
          {steps.map((step, i) => (
            <li key={step.id} className={step.done ? styles.stepDone : undefined}>
              <a href={`#${step.id}`} className="chip">
                <span className={styles.stepNum} aria-hidden="true">
                  {step.done ? "✓" : i + 1}
                </span>
                {step.label}
                {step.done && <span className="sr-only">, done</span>}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. The gear */}
      <section className={styles.section} id="step-gear" aria-labelledby="step-gear-title">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum} aria-hidden="true">
            1
          </span>
          <div>
            <h2 className={styles.sectionTitle} id="step-gear-title">
              The gear
            </h2>
            <p className={styles.sectionSub}>Which model did you try?</p>
          </div>
        </div>

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="product">
              Model <span className={styles.required}>Required</span>
            </label>
          </div>
          <select id="product" name="product" required value={product} onChange={(e) => chooseProduct(e.target.value)}>
            <option value="">Choose a model</option>
            {GROUPS.map((group) => (
              <optgroup key={group.category} label={group.label}>
                {products
                  .filter((p) => p.category === group.category)
                  .map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {selected && (
          <div className={styles.preview}>
            {previews[selected.slug] ?? null}
            <p className={styles.previewName}>{selected.label}</p>
          </div>
        )}

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="switched_from">
              Switched from <span className={styles.optional}>(optional)</span>
            </label>
            <XpTag {...xp.switched} hidden={alreadyRewarded} />
          </div>
          <select
            id="switched_from"
            name="switched_from"
            value={switchedFrom}
            onChange={(e) => setSwitchedFrom(e.target.value)}
            disabled={!selected}
          >
            <option value="">{selected ? "None, or not listed" : "Choose a model first"}</option>
            {switchOptions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 2. The verdict */}
      <section className={styles.section} id="step-verdict" aria-labelledby="step-verdict-title">
        <div className={styles.sectionHead}>
          <span className={`${styles.sectionNum} ${styles.num_2}`} aria-hidden="true">
            2
          </span>
          <div>
            <h2 className={styles.sectionTitle} id="step-verdict-title">
              The verdict
            </h2>
            <p className={styles.sectionSub}>Returned and rejected gear helps the next player as much as kept gear.</p>
          </div>
        </div>

        <fieldset className="field">
          <legend>
            What happened? <span className={styles.required}>Required</span>
          </legend>
          <div className={styles.tiles}>
            {outcomes.map((o) => (
              <label key={o.value} className={`${styles.pick} ${styles.tile} ${styles[`tile_${o.value}`] ?? ""}`}>
                <input
                  type="radio"
                  name="outcome"
                  value={o.value}
                  required
                  checked={outcome === o.value}
                  onChange={() => setOutcome(o.value)}
                />
                <span className={styles.tileWord}>{o.label}</span>
                {OUTCOME_NOTES[o.value] && <span className={styles.tileNote}>{OUTCOME_NOTES[o.value]}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="reason">
              Reason for this outcome <span className={styles.required}>Required</span>
            </label>
            <XpTag {...xp.reason} hidden={alreadyRewarded} />
          </div>
          <textarea
            id="reason"
            name="reason"
            required
            maxLength={limits.reason}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-describedby="reason-hint"
          />
          <span className="hint" id="reason-hint">
            The one thing that decided it for you. A full sentence earns detail XP.
          </span>
          <span className={styles.counter} aria-hidden="true">
            {reason.length}/{limits.reason}
          </span>
        </div>
      </section>

      {/* 3. The details */}
      <section className={styles.section} id="step-details" aria-labelledby="step-details-title">
        <div className={styles.sectionHead}>
          <span className={`${styles.sectionNum} ${styles.num_3}`} aria-hidden="true">
            3
          </span>
          <div>
            <h2 className={styles.sectionTitle} id="step-details-title">
              The details
            </h2>
            <p className={styles.sectionSub}>All optional. Each specific detail adds XP, shown on its tag.</p>
          </div>
        </div>

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="felt_different">
              What felt different <span className={styles.optional}>(optional)</span>
            </label>
            <XpTag {...xp.felt} hidden={alreadyRewarded} />
          </div>
          <textarea
            id="felt_different"
            name="felt_different"
            maxLength={limits.feltDifferent}
            value={feltDifferent}
            onChange={(e) => setFeltDifferent(e.target.value)}
          />
        </div>

        <fieldset className="field">
          <legend>
            Comfort <span className={styles.optional}>(optional)</span>
          </legend>
          <div className={styles.chipSet}>
            <label className={`${styles.pick} ${styles.chipPick}`}>
              <input type="radio" name="comfort" value="" checked={comfort === ""} onChange={() => setComfort("")} />
              Not rated
            </label>
            {["1", "2", "3", "4", "5"].map((n) => (
              <label key={n} className={`${styles.pick} ${styles.chipPick}`}>
                <input type="radio" name="comfort" value={n} checked={comfort === n} onChange={() => setComfort(n)} />
                {comfort !== "" && Number(n) <= Number(comfort) && <ComfortBall />}
                {n}
                {n === "1" && <span className="sr-only">, uncomfortable</span>}
                {n === "5" && <span className="sr-only">, very comfortable</span>}
              </label>
            ))}
          </div>
          <span className="hint">1 is uncomfortable, 5 is very comfortable.</span>
        </fieldset>

        <div className={styles.pair}>
          <div className="field">
            <div className={styles.labelRow}>
              <label htmlFor="size">
                Size <span className={styles.optional}>(optional)</span>
              </label>
              <XpTag {...xp.size} hidden={alreadyRewarded} />
            </div>
            <input
              id="size"
              name="size"
              maxLength={limits.size}
              value={size}
              onChange={(e) => setSize(e.target.value)}
              autoComplete="off"
              aria-describedby="size-hint"
            />
            <span className="hint" id="size-hint">
              {isRacquet ? "Your grip size, such as 4 3/8." : "The size you tried, such as US 10."}
            </span>
          </div>

          {!isRacquet && (
            <div className="field">
              <div className={styles.labelRow}>
                <label htmlFor="width">
                  Width <span className={styles.optional}>(optional)</span>
                </label>
                <XpTag {...xp.width} hidden={alreadyRewarded} />
              </div>
              <input
                id="width"
                name="width"
                maxLength={limits.width}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                autoComplete="off"
                aria-describedby="width-hint"
              />
              <span className="hint" id="width-hint">
                The width you tried, such as standard, wide or 2E.
              </span>
            </div>
          )}
        </div>

        <fieldset className="field">
          <legend className={`${styles.labelRow} ${styles.legendRow}`}>
            <span>
              Surface <span className={styles.optional}>(optional)</span>
            </span>
            <XpTag {...xp.surface} hidden={alreadyRewarded} />
          </legend>
          <div className={styles.chipSet}>
            <label className={`${styles.pick} ${styles.chipPick}`}>
              <input type="radio" name="surface" value="" checked={surface === ""} onChange={() => setSurface("")} />
              Not given
            </label>
            {surfaces.map((s) => (
              <label key={s.value} className={`${styles.pick} ${styles.chipPick}`}>
                <input
                  type="radio"
                  name="surface"
                  value={s.value}
                  checked={surface === s.value}
                  onChange={() => setSurface(s.value)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.pair}>
          <div className="field">
            <div className={styles.labelRow}>
              <label htmlFor="hours">
                Hours played <span className={styles.optional}>(optional)</span>
              </label>
              <XpTag {...xp.hours} hidden={alreadyRewarded} />
            </div>
            <input
              id="hours"
              name="hours"
              type="number"
              inputMode="decimal"
              min={0}
              max={limits.hours}
              step="any"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              aria-describedby="hours-hint"
            />
            <span className="hint" id="hours-hint">
              Returned it unplayed? Zero counts.
            </span>
          </div>

          {isShoe && (
            <div className="field">
              <div className={styles.labelRow}>
                <label htmlFor="wear_location">
                  Where it wore first <span className={styles.optional}>(optional)</span>
                </label>
                <XpTag {...xp.wear} hidden={alreadyRewarded} />
              </div>
              <input
                id="wear_location"
                name="wear_location"
                maxLength={limits.wear}
                value={wear}
                onChange={(e) => setWear(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}

          {isRacquet && (
            <div className="field">
              <div className={styles.labelRow}>
                <label htmlFor="string_setup">
                  String, gauge and tension <span className={styles.optional}>(optional)</span>
                </label>
                <XpTag {...xp.strings} hidden={alreadyRewarded} />
              </div>
              <input
                id="string_setup"
                name="string_setup"
                maxLength={limits.stringSetup}
                value={stringSetup}
                onChange={(e) => setStringSetup(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}
        </div>
      </section>

      <p className={styles.fine}>
        {alreadyRewarded
          ? "You already earned XP for reporting on this model. A new report still helps the next player."
          : "XP depends on how much specific detail you give. It never depends on whether your verdict is positive."}
      </p>

      {/* 4. Publish: a sticky dock with the live XP meter */}
      <div className={styles.dock}>
        {state.error && (
          <p className={styles.dockError} role="alert">
            {state.error}
          </p>
        )}
        <div className={styles.dockRow}>
          <span key={shownTarget} className={`${styles.xpNow} ${styles.xpBump}`} aria-hidden="true">
            <span className={styles.xpNumber}>+{shown}</span>
            <span className={styles.xpUnit}>XP</span>
          </span>
          <div className={styles.meterCol}>
            <div className={styles.meter} aria-hidden="true">
              <div className={styles.meterFill} style={{ transform: `scaleX(${fill})` }} />
            </div>
            <span className={styles.meterText}>
              {alreadyRewarded ? (
                "Already earned"
              ) : (
                <>
                  <span className={styles.meterShort}>of {maxXp} XP</span>
                  <span className={styles.meterLong}>of {maxXp} XP for a fully detailed report</span>
                </>
              )}
            </span>
          </div>
          <button type="submit" className={`btn ${styles.publish}`} disabled={pending}>
            {pending ? (
              "Publishing"
            ) : (
              <>
                Publish<span className={styles.meterLong}> report</span>
              </>
            )}
          </button>
        </div>
        <p className="sr-only" role="status">
          {alreadyRewarded ? "+0 XP. You already earned XP for reporting on this model." : `+${estimate} XP`}
        </p>
      </div>
    </form>
  );
}
