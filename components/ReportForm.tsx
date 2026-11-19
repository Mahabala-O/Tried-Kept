"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { createReport } from "@/lib/actions/reports";
import type { Category } from "@/lib/catalog";
import { reportXp } from "@/lib/gamification";
import type { ReportActionState } from "@/lib/reports";

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
};

const INITIAL: ReportActionState = {};
const GROUPS: { category: Category; label: string }[] = [
  { category: "shoe", label: "Shoes" },
  { category: "racquet", label: "Racquets" },
];

export default function ReportForm({ products, outcomes, surfaces, limits, initialProduct, rewardedSlugs }: Props) {
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
  const estimate = reportXp({
    category: selected?.category,
    size: size.trim(),
    width: width.trim(),
    surface,
    hours: hoursValue,
    felt_different: feltDifferent.trim(),
    reason: reason.trim(),
    wear_location: isShoe ? wear.trim() : "",
    string_setup: isRacquet ? stringSetup.trim() : "",
    switched_from_slug: switchedFrom || null,
  });
  const alreadyRewarded = rewardedSlugs.includes(product);

  return (
    <form action={formAction} onSubmit={submit} className="form">
      <div className="field">
        <label htmlFor="product">Model</label>
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

      <div className="field">
        <label htmlFor="switched_from">Switched from (optional)</label>
        <select
          id="switched_from"
          name="switched_from"
          value={switchedFrom}
          onChange={(e) => setSwitchedFrom(e.target.value)}
          disabled={!selected}
        >
          <option value="">{selected ? "I did not switch from a listed model" : "Choose a model first"}</option>
          {switchOptions.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="field">
        <legend>What happened?</legend>
        <div className="stack">
          {outcomes.map((o) => (
            <label key={o.value} className="choice">
              <input
                type="radio"
                name="outcome"
                value={o.value}
                required
                checked={outcome === o.value}
                onChange={() => setOutcome(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="reason">Reason for this outcome</label>
        <textarea
          id="reason"
          name="reason"
          required
          maxLength={limits.reason}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <span className="hint">The one thing that decided it for you. A full sentence earns detail XP.</span>
      </div>

      <div className="field">
        <label htmlFor="felt_different">What felt different (optional)</label>
        <textarea
          id="felt_different"
          name="felt_different"
          maxLength={limits.feltDifferent}
          value={feltDifferent}
          onChange={(e) => setFeltDifferent(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="comfort">Comfort (optional)</label>
        <select id="comfort" name="comfort" value={comfort} onChange={(e) => setComfort(e.target.value)}>
          <option value="">Not rated</option>
          <option value="1">1, uncomfortable</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5, very comfortable</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="size">Size (optional)</label>
        <input
          id="size"
          name="size"
          maxLength={limits.size}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          autoComplete="off"
        />
        <span className="hint">{isRacquet ? "Your grip size, such as 4 3/8." : "The size you tried, such as US 10."}</span>
      </div>

      {!isRacquet && (
        <div className="field">
          <label htmlFor="width">Width (optional)</label>
          <input
            id="width"
            name="width"
            maxLength={limits.width}
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            autoComplete="off"
          />
          <span className="hint">The width you tried, such as standard, wide or 2E.</span>
        </div>
      )}

      <div className="field">
        <label htmlFor="surface">Surface (optional)</label>
        <select id="surface" name="surface" value={surface} onChange={(e) => setSurface(e.target.value)}>
          <option value="">Not given</option>
          {surfaces.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="hours">Hours played (optional)</label>
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
        />
      </div>

      {isShoe && (
        <div className="field">
          <label htmlFor="wear_location">Where it wore first (optional)</label>
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
          <label htmlFor="string_setup">String, gauge and tension (optional)</label>
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

      <div className="callout" role="status">
        {alreadyRewarded ? (
          <>
            <p>+0 XP</p>
            <span className="small">
              You already earned XP for reporting on this model. A new report still helps the next player.
            </span>
          </>
        ) : (
          <>
            <p>+{estimate} XP</p>
            <span className="small">
              XP depends on how much specific detail you give. It never depends on whether your verdict is positive.
            </span>
          </>
        )}
      </div>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Publishing" : "Publish report"}
        </button>
      </div>
    </form>
  );
}
