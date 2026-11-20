"use client";

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createReport } from "@/lib/actions/reports";
import type { Category } from "@/lib/catalog";
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
  initialSwitchedFrom?: string;
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
function ComfortBall() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.comfortBall}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="#E6FF3D"
        stroke="#0E2A2A"
        strokeWidth="2"
      />
      <path
        d="M5 5.5c3.2 3.6 3.2 9.4 0 13M19 5.5c-3.2 3.6-3.2 9.4 0 13"
        fill="none"
        stroke="#0E2A2A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ReportForm({
  products,
  outcomes,
  surfaces,
  limits,
  initialProduct,
  initialSwitchedFrom = "",
  previews = {},
}: Props) {
  const [state, formAction, pending] = useActionState(createReport, INITIAL);

  const [product, setProduct] = useState(initialProduct);
  const [switchedFrom, setSwitchedFrom] = useState(initialSwitchedFrom);
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
    ? products.filter(
        (p) => p.category === selected.category && p.slug !== selected.slug,
      )
    : [];

  function chooseProduct(slug: string) {
    setProduct(slug);
    const next = products.find((p) => p.slug === slug);
    const previous = products.find((p) => p.slug === switchedFrom);
    if (
      !next ||
      !previous ||
      previous.slug === next.slug ||
      previous.category !== next.category
    ) {
      setSwitchedFrom("");
    }
  }

  // Submitting by hand keeps the player's answers on screen if the server rejects them.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  const detailsGiven =
    comfort !== "" ||
    [size, width, surface, feltDifferent, wear, stringSetup].some(
      (value) => value.trim() !== "",
    ) ||
    (hours.trim() !== "" &&
      Number.isFinite(Number(hours)) &&
      Number(hours) > 0);

  const steps = [
    { id: "step-gear", label: "Gear", done: Boolean(selected) },
    {
      id: "step-verdict",
      label: "Verdict",
      done: Boolean(outcome) && reason.trim() !== "",
    },
    { id: "step-details", label: "Details", done: detailsGiven },
  ];

  return (
    <form action={formAction} onSubmit={submit} className={styles.form}>
      <nav className={styles.steps} aria-label="Report sections">
        <ol className="chip-scroll">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className={step.done ? styles.stepDone : undefined}
            >
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
      <section
        className={styles.section}
        id="step-gear"
        aria-labelledby="step-gear-title"
      >
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
          <select
            id="product"
            name="product"
            required
            value={product}
            onChange={(e) => chooseProduct(e.target.value)}
          >
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
            {previews[selected.slug] ?? (
              <p className={styles.previewName}>{selected.label}</p>
            )}
          </div>
        )}

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="switched_from">
              Switched from <span className={styles.optional}>(optional)</span>
            </label>
          </div>
          <select
            id="switched_from"
            name="switched_from"
            value={switchedFrom}
            onChange={(e) => setSwitchedFrom(e.target.value)}
            disabled={!selected}
          >
            <option value="">
              {selected ? "None, or not listed" : "Choose a model first"}
            </option>
            {switchOptions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 2. The verdict */}
      <section
        className={styles.section}
        id="step-verdict"
        aria-labelledby="step-verdict-title"
      >
        <div className={styles.sectionHead}>
          <span
            className={`${styles.sectionNum} ${styles.num_2}`}
            aria-hidden="true"
          >
            2
          </span>
          <div>
            <h2 className={styles.sectionTitle} id="step-verdict-title">
              The verdict
            </h2>
            <p className={styles.sectionSub}>
              Returned and rejected gear helps the next player as much as kept
              gear.
            </p>
          </div>
        </div>

        <fieldset className="field">
          <legend>
            What happened? <span className={styles.required}>Required</span>
          </legend>
          <div className={styles.tiles}>
            {outcomes.map((o) => (
              <label
                key={o.value}
                className={`${styles.pick} ${styles.tile} ${styles[`tile_${o.value}`] ?? ""}`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value={o.value}
                  required
                  checked={outcome === o.value}
                  onChange={() => setOutcome(o.value)}
                />
                <span className={styles.tileWord}>{o.label}</span>
                {OUTCOME_NOTES[o.value] && (
                  <span className={styles.tileNote}>
                    {OUTCOME_NOTES[o.value]}
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="reason">
              Reason for this outcome{" "}
              <span className={styles.required}>Required</span>
            </label>
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
            The one thing that decided it for you. Explain it in your own words.
          </span>
          <span className={styles.counter} aria-hidden="true">
            {reason.length}/{limits.reason}
          </span>
        </div>
      </section>

      {/* 3. The details */}
      <section
        className={styles.section}
        id="step-details"
        aria-labelledby="step-details-title"
      >
        <div className={styles.sectionHead}>
          <span
            className={`${styles.sectionNum} ${styles.num_3}`}
            aria-hidden="true"
          >
            3
          </span>
          <div>
            <h2 className={styles.sectionTitle} id="step-details-title">
              The details
            </h2>
            <p className={styles.sectionSub}>
              All optional. Fit, court and hours help another player judge
              whether your experience applies to them.
            </p>
          </div>
        </div>

        <div className="field">
          <div className={styles.labelRow}>
            <label htmlFor="felt_different">
              What felt different{" "}
              <span className={styles.optional}>(optional)</span>
            </label>
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
              <input
                type="radio"
                name="comfort"
                value=""
                checked={comfort === ""}
                onChange={() => setComfort("")}
              />
              Not rated
            </label>
            {["1", "2", "3", "4", "5"].map((n) => (
              <label key={n} className={`${styles.pick} ${styles.chipPick}`}>
                <input
                  type="radio"
                  name="comfort"
                  value={n}
                  checked={comfort === n}
                  onChange={() => setComfort(n)}
                />
                {comfort !== "" && Number(n) <= Number(comfort) && (
                  <ComfortBall />
                )}
                {n}
                {n === "1" && <span className="sr-only">, uncomfortable</span>}
                {n === "5" && (
                  <span className="sr-only">, very comfortable</span>
                )}
              </label>
            ))}
          </div>
          <span className="hint">
            1 is uncomfortable, 5 is very comfortable.
          </span>
        </fieldset>

        <div className={styles.pair}>
          <div className="field">
            <div className={styles.labelRow}>
              <label htmlFor="size">
                Size <span className={styles.optional}>(optional)</span>
              </label>
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
              {isRacquet
                ? "Your grip size, such as 4 3/8."
                : "The size you tried, such as US 10."}
            </span>
          </div>

          {!isRacquet && (
            <div className="field">
              <div className={styles.labelRow}>
                <label htmlFor="width">
                  Width <span className={styles.optional}>(optional)</span>
                </label>
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
          </legend>
          <div className={styles.chipSet}>
            <label className={`${styles.pick} ${styles.chipPick}`}>
              <input
                type="radio"
                name="surface"
                value=""
                checked={surface === ""}
                onChange={() => setSurface("")}
              />
              Not given
            </label>
            {surfaces.map((s) => (
              <label
                key={s.value}
                className={`${styles.pick} ${styles.chipPick}`}
              >
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
                  Where it wore first{" "}
                  <span className={styles.optional}>(optional)</span>
                </label>
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
                  String, gauge and tension{" "}
                  <span className={styles.optional}>(optional)</span>
                </label>
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
        Specific details help other players decide. A return is as useful to
        hear about as a keeper.
      </p>

      <div className={styles.dock}>
        {state.error && (
          <p className={styles.dockError} role="alert">
            {state.error}
          </p>
        )}
        <div className={styles.dockRow}>
          <p className={styles.publishNote}>Ready to share what changed?</p>
          <button
            type="submit"
            className={`btn ${styles.publish}`}
            disabled={pending}
          >
            {pending ? (
              "Publishing"
            ) : (
              <>
                Publish<span className={styles.meterLong}> report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
