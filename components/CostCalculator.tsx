"use client";

import { useState } from "react";
import { GapNote } from "@/components/ui";
import { breakEvenHours, costPerHour } from "@/lib/finder";

const DEFAULTS = { priceA: "135", hoursA: "60", priceB: "180", hoursB: "" };
const MAX_VALUE = 100_000;

type Parsed = { value: number | null; error: string | null };

function parseAmount(raw: string, label: string): Parsed {
  const text = raw.trim().replace(/^\$/, "");
  if (text === "") return { value: null, error: `Enter ${label}.` };
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(text)) return { value: null, error: `Use a number for ${label}.` };
  const value = Number(text);
  if (value < 0) return { value: null, error: `${capitalize(label)} cannot be negative.` };
  if (value === 0) return { value: null, error: `${capitalize(label)} must be more than zero.` };
  if (value > MAX_VALUE) return { value: null, error: `${capitalize(label)} is too large for this calculator.` };
  return { value, error: null };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function hours(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function Field({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="form-error small">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CostCalculator() {
  const [values, setValues] = useState(DEFAULTS);
  const set = (key: keyof typeof DEFAULTS) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  const priceA = parseAmount(values.priceA, "the price of pair A");
  const hoursA = parseAmount(values.hoursA, "the hours for pair A");
  const priceB = parseAmount(values.priceB, "the price of pair B");
  const hoursBEmpty = values.hoursB.trim() === "";
  const hoursB = hoursBEmpty ? { value: null, error: null } : parseAmount(values.hoursB, "the hours for pair B");

  const ready = priceA.value !== null && hoursA.value !== null && priceB.value !== null && hoursB.error === null;

  const hourlyA = ready ? costPerHour(priceA.value, hoursA.value) : null;
  const breakEven = ready ? breakEvenHours(priceA.value as number, hoursA.value as number, priceB.value as number) : null;
  const hourlyB = ready && hoursB.value !== null ? costPerHour(priceB.value, hoursB.value) : null;
  const gap = breakEven !== null && hoursA.value !== null ? breakEven - hoursA.value : null;

  return (
    <div className="stack-lg">
      <div className="grid">
        <div className="card">
          <h2>Pair A</h2>
          <Field id="price-a" label="Price in USD" value={values.priceA} error={priceA.error} onChange={set("priceA")} />
          <Field
            id="hours-a"
            label="Hours it lasts"
            hint="Your own estimate."
            value={values.hoursA}
            error={hoursA.error}
            onChange={set("hoursA")}
          />
        </div>
        <div className="card">
          <h2>Pair B</h2>
          <Field id="price-b" label="Price in USD" value={values.priceB} error={priceB.error} onChange={set("priceB")} />
          <Field
            id="hours-b"
            label="Hours it lasts (optional)"
            hint="Leave empty to see only the break-even."
            value={values.hoursB}
            error={hoursB.error}
            onChange={set("hoursB")}
          />
        </div>
      </div>

      <div aria-live="polite">
        {ready && hourlyA !== null && breakEven !== null ? (
          <div className="callout">
            <span className="eyebrow">Illustration only</span>
            <p>Pair A costs {money(hourlyA)} per hour.</p>
            <p>
              Pair B must last {hours(breakEven)} hours to match it.
            </p>
            {gap !== null && Math.abs(gap) >= 0.05 && (
              <span className="small muted">
                That is {hours(Math.abs(gap))} {gap > 0 ? "more" : "fewer"} hours than pair A.
              </span>
            )}
            {hourlyB !== null && (
              <span className="small muted">
                At {hours(hoursB.value as number)} hours, pair B costs {money(hourlyB)} per hour.
              </span>
            )}
          </div>
        ) : (
          <GapNote>Fix the fields marked above to see the numbers.</GapNote>
        )}
      </div>

      <div className="stack">
        <p className="small muted">
          These numbers are an illustration, not a durability claim. We have no recorded wear hours for any shoe here. The
          starting prices are Nike's U.S. prices for the Vapor Pro 3 ($135) and Vapor 12 ($180), checked November 18, 2026.
          The 60 hours is an example.
        </p>
        <div className="row">
          <button type="button" className="btn" onClick={() => setValues(DEFAULTS)}>
            Reset to the example
          </button>
        </div>
      </div>
    </div>
  );
}
