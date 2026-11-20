"use client";
import { useState } from "react";
import type { Category } from "@/lib/catalog";
import { racquetGoals, shoeGoals } from "@/lib/gear-goals";
import s from "./journeys.module.css";

export default function DiscoveryForm({
  players,
  proSlug,
  category,
  goal,
  line,
  surface,
}: {
  players: { slug: string; name: string }[];
  proSlug: string;
  category: Category;
  goal: string;
  line: string;
  surface: string;
}) {
  const [kind, setKind] = useState(category);
  const goals = kind === "racquet" ? racquetGoals : shoeGoals;
  return (
    <form action="/discover#shortlist" className={s.form}>
      <div className="field">
        <label htmlFor="discover-pro">1. Whose setup caught your eye?</label>
        <select id="discover-pro" name="pro" defaultValue={proSlug} required>
          <option value="" disabled>
            Choose a pro
          </option>
          {players.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="discover-kind">2. What are you exploring?</label>
        <select
          id="discover-kind"
          name="category"
          value={kind}
          onChange={(e) => setKind(e.target.value as Category)}
        >
          <option value="racquet">Racquets</option>
          <option value="shoe">Shoes</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="discover-goal">3. What matters most to you?</label>
        <select
          id="discover-goal"
          name="goal"
          key={kind}
          defaultValue={
            goals.some((g) => g.value === goal) ? goal : goals[0].value
          }
        >
          {goals.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      {kind === "shoe" && (
        <>
          <div className="field">
            <label htmlFor="discover-line">Retail sizing line</label>
            <select id="discover-line" name="line" defaultValue={line}>
              <option value="mens">Men's</option>
              <option value="womens">Women's</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="discover-surface">Your court surface</label>
            <select id="discover-surface" name="surface" defaultValue={surface}>
              <option value="hard">Hard court</option>
              <option value="clay">Clay</option>
            </select>
          </div>
        </>
      )}
      <button type="submit" className="btn btn-optic">
        Show my two options →
      </button>
    </form>
  );
}
