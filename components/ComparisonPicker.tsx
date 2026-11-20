"use client";
import { useState } from "react";
import type { Category } from "@/lib/catalog";
import s from "./journeys.module.css";

type Model = { slug: string; label: string; category: Category };
export default function ComparisonPicker({
  models,
  initialLeft,
  initialRight,
}: {
  models: Model[];
  initialLeft: string;
  initialRight: string;
}) {
  const [left, setLeft] = useState(
    models.some((p) => p.slug === initialLeft) ? initialLeft : "",
  );
  const [right, setRight] = useState(
    models.some(
      (p) =>
        p.slug === initialRight &&
        p.slug !== left &&
        p.category === models.find((m) => m.slug === left)?.category,
    )
      ? initialRight
      : "",
  );
  const category = models.find((p) => p.slug === left)?.category;
  const alternatives = models.filter(
    (p) => p.category === category && p.slug !== left,
  );
  return (
    <form action="/gear/compare#comparison" className={s.form}>
      <div className="field">
        <label htmlFor="compare-left">First model</label>
        <select
          id="compare-left"
          name="left"
          value={left}
          required
          onChange={(e) => {
            const next = models.find((p) => p.slug === e.target.value);
            setLeft(e.target.value);
            if (
              right === e.target.value ||
              models.find((p) => p.slug === right)?.category !== next?.category
            )
              setRight("");
          }}
        >
          <option value="">Choose a model</option>
          {(["shoe", "racquet"] as const).map((kind) => (
            <optgroup key={kind} label={kind === "shoe" ? "Shoes" : "Racquets"}>
              {models
                .filter((p) => p.category === kind)
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
        <label htmlFor="compare-right">Second model</label>
        <select
          id="compare-right"
          name="right"
          value={right}
          disabled={!left}
          required
          onChange={(e) => setRight(e.target.value)}
        >
          <option value="">
            {left ? "Choose an alternative" : "Choose the first model above"}
          </option>
          {alternatives.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-optic" type="submit">
        Compare models
      </button>
    </form>
  );
}
