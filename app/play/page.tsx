import type { Metadata } from "next";
import Link from "next/link";
import s from "@/components/journeys.module.css";
export const metadata: Metadata = { title: "Tools & games" };
const tools = [
  {
    href: "/play/finder",
    title: "Gear Match",
    text: "Answer a few fit questions and see which shoes have recorded facts that match, with their unknowns listed.",
  },
  {
    href: "/play/cost",
    title: "Cost per hour",
    text: "Compare what you pay with how long a pair lasts. Work with your own prices and hours.",
  },
  {
    href: "/play/rally",
    title: "Spec Rally",
    text: "A short tennis gear quiz. Check the explanation and its source, then use the fact in your next comparison.",
  },
];
export default function PlayPage() {
  return (
    <div className="wrap page">
      <header className={s.intro}>
        <span className="eyebrow">A little help with the decision</span>
        <h1 className={s.title}>Tools. A few games. Better questions.</h1>
        <p className="lede">
          Use these when they help your next gear choice. No account needed to
          play.
        </p>
      </header>
      <section className={s.grid} aria-label="Tools and games">
        {tools.map((tool) => (
          <article className="card" key={tool.href}>
            <h2>{tool.title}</h2>
            <p>{tool.text}</p>
            <Link href={tool.href} className="btn btn-primary">
              Open {tool.title}
            </Link>
          </article>
        ))}
      </section>
      <Link href="/switch" className="tap-link">
        Back to finding your next keeper →
      </Link>
    </div>
  );
}
