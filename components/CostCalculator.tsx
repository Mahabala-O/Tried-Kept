"use client";

import { useState, type CSSProperties } from "react";
import ShoeArt from "@/components/art/ShoeArt";
import { COLORS } from "@/components/art/palette";
import s from "@/components/games.module.css";
import { GapNote } from "@/components/ui";
import { breakEvenHours, costPerHour } from "@/lib/finder";

const DEFAULTS = { priceA: "135", hoursA: "60", priceB: "180", hoursB: "" };
const MAX_VALUE = 100_000;
const STEP = 5;

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

/** Moves a field up or down by STEP from whatever number it holds now, staying above zero. */
function stepped(raw: string, direction: 1 | -1): string {
  const current = Number(raw.trim().replace(/^\$/, ""));
  const base = Number.isFinite(current) && raw.trim() !== "" ? current : 0;
  const next = Math.min(MAX_VALUE, Math.max(1, Math.round((base + direction * STEP) * 100) / 100));
  return String(next);
}

function pct(value: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.max(2, Math.min(100, (value / max) * 100)).toFixed(1)}%`;
}

function Field({
  id,
  label,
  hint,
  value,
  error,
  prefix,
  unit,
  stepLabel,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error: string | null;
  prefix?: string;
  unit?: string;
  /** Names the field in the stepper buttons, such as "the price of pair A". */
  stepLabel: string;
  onChange: (value: string) => void;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div className={s.amountField}>
      <label htmlFor={id}>{label}</label>
      <div className={s.amount} data-invalid={error ? true : undefined}>
        <button
          type="button"
          className={s.stepBtn}
          aria-label={`Lower ${stepLabel} by ${STEP}`}
          aria-controls={id}
          onClick={() => onChange(stepped(value, -1))}
        >
          <span aria-hidden="true">&minus;</span>
        </button>
        {prefix && (
          <span className={s.affix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={s.amountInput}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit && (
          <span className={`${s.affix} ${s.affixUnit}`} aria-hidden="true">
            {unit}
          </span>
        )}
        <button
          type="button"
          className={s.stepBtn}
          aria-label={`Raise ${stepLabel} by ${STEP}`}
          aria-controls={id}
          onClick={() => onChange(stepped(value, 1))}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
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

function Bar({ name, value, width, fill, target }: { name: string; value: string; width?: string; fill?: "a" | "b"; target?: string }) {
  return (
    <div className={s.barRow}>
      <span className={s.barName}>{name}</span>
      <span className={s.barTrack}>
        {target && <span className={s.barTarget} style={{ "--w": target } as CSSProperties} />}
        {width && fill && (
          <span className={`${s.barFill} ${fill === "a" ? s.fillA : s.fillB}`} style={{ "--w": width } as CSSProperties} />
        )}
      </span>
      <span className={s.barValue}>{value}</span>
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

  const costMax = Math.max(hourlyA ?? 0, hourlyB ?? 0);
  const hoursMax = Math.max(hoursA.value ?? 0, breakEven ?? 0, hoursB.value ?? 0);
  const verdict =
    hourlyA !== null && hourlyB !== null
      ? Math.abs(hourlyB - hourlyA) < 0.005
        ? { text: "Same cost per hour", tone: "sticker-paper" }
        : hourlyB < hourlyA
          ? { text: "Pair B costs less per hour", tone: "sticker-xp" }
          : { text: "Pair A costs less per hour", tone: "sticker-xp" }
      : null;

  return (
    <div className={`stack-lg ${s.game}`}>
      <div className={s.pairs}>
        <section className={`card ${s.pair}`} aria-labelledby="pair-a-title">
          <div className={`${s.pairHead} ${s.pairA}`}>
            <h2 id="pair-a-title">Pair A</h2>
            <ShoeArt
              className={s.pairArt}
              seed="court-cost-a"
              main={COLORS.paper}
              accent={COLORS.optic}
              detail={COLORS.hardcourt}
              base={COLORS.optic}
              lace={COLORS.ink}
            />
          </div>
          <div className={s.pairFields}>
            <Field
              id="price-a"
              label="Price in USD"
              prefix="$"
              stepLabel="the price of pair A"
              value={values.priceA}
              error={priceA.error}
              onChange={set("priceA")}
            />
            <Field
              id="hours-a"
              label="Hours it lasts"
              hint="Your own estimate."
              unit="hrs"
              stepLabel="the hours for pair A"
              value={values.hoursA}
              error={hoursA.error}
              onChange={set("hoursA")}
            />
          </div>
        </section>

        <span className={`sticker sticker-xp ${s.vs} tilt-left`} aria-hidden="true">
          vs
        </span>

        <section className={`card ${s.pair}`} aria-labelledby="pair-b-title">
          <div className={`${s.pairHead} ${s.pairB}`}>
            <h2 id="pair-b-title">Pair B</h2>
            <ShoeArt
              className={s.pairArt}
              seed="court-cost-b"
              main={COLORS.optic}
              accent={COLORS.ink}
              detail={COLORS.paper}
              base={COLORS.paper}
              lace={COLORS.ink}
            />
          </div>
          <div className={s.pairFields}>
            <Field
              id="price-b"
              label="Price in USD"
              prefix="$"
              stepLabel="the price of pair B"
              value={values.priceB}
              error={priceB.error}
              onChange={set("priceB")}
            />
            <Field
              id="hours-b"
              label="Hours it lasts (optional)"
              hint="Leave empty to see only the break-even."
              unit="hrs"
              stepLabel="the hours for pair B"
              value={values.hoursB}
              error={hoursB.error}
              onChange={set("hoursB")}
            />
          </div>
        </section>
      </div>

      <div aria-live="polite">
        {ready && hourlyA !== null && breakEven !== null ? (
          <section className={`card ${s.panel} ${s.costResult}`} aria-label="Result">
            <div className="row between">
              <span className="eyebrow">Illustration only</span>
              {verdict && <span className={`sticker ${verdict.tone} sticker-plain sticker-sm tilt-right`}>{verdict.text}</span>}
            </div>

            <p className={s.headline} aria-hidden="true">
              {hours(breakEven)} <small>hours for pair B to match pair A</small>
            </p>

            <div className={s.sentences}>
              <p>Pair A costs {money(hourlyA)} per hour.</p>
              <p>Pair B must last {hours(breakEven)} hours to match it.</p>
              {gap !== null && Math.abs(gap) >= 0.05 && (
                <p className="small muted">
                  That is {hours(Math.abs(gap))} {gap > 0 ? "more" : "fewer"} hours than pair A.
                </p>
              )}
              {hourlyB !== null && (
                <p className="small muted">
                  At {hours(hoursB.value as number)} hours, pair B costs {money(hourlyB)} per hour.
                </p>
              )}
            </div>

            <div className={s.chart} aria-hidden="true">
              <p className={s.chartTitle}>Cost per hour</p>
              <Bar name="Pair A" value={`${money(hourlyA)}/hr`} width={pct(hourlyA, costMax)} fill="a" />
              {hourlyB !== null ? (
                <Bar name="Pair B" value={`${money(hourlyB)}/hr`} width={pct(hourlyB, costMax)} fill="b" />
              ) : (
                <Bar name="Pair B" value="Add hours" />
              )}
            </div>

            <div className={s.chart} aria-hidden="true">
              <p className={s.chartTitle}>Hours on court</p>
              <Bar name="Pair A" value={`${hours(hoursA.value as number)} hrs`} width={pct(hoursA.value as number, hoursMax)} fill="a" />
              <Bar
                name="Pair B"
                value={hoursB.value !== null ? `${hours(hoursB.value)} hrs` : `${hours(breakEven)} hrs`}
                target={pct(breakEven, hoursMax)}
                width={hoursB.value !== null ? pct(hoursB.value, hoursMax) : undefined}
                fill={hoursB.value !== null ? "b" : undefined}
              />
              <p className={s.legend}>
                <span>
                  <span className={s.legendDash} /> Pair B break-even, {hours(breakEven)} hrs
                </span>
              </p>
            </div>
          </section>
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
        <div className="cta-row">
          <button type="button" className="btn" onClick={() => setValues(DEFAULTS)}>
            Reset to the example
          </button>
        </div>
      </div>
    </div>
  );
}
