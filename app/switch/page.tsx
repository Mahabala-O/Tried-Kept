import type { Metadata } from "next";
import SwitchGuide from "@/components/SwitchGuide";
import s from "@/components/journeys.module.css";
export const metadata: Metadata = {
  title: "Find your next keeper",
  description:
    "Start with your current tennis gear, name what you want to improve, and investigate the tradeoffs before logging your trial.",
};
export default async function SwitchPage({
  searchParams,
}: {
  searchParams: Promise<{
    current?: string | string[];
    priority?: string | string[];
    line?: string | string[];
    surface?: string | string[];
  }>;
}) {
  const { current, priority, line, surface } = await searchParams;
  return (
    <div className="wrap page">
      <header className={s.intro}>
        <span className="eyebrow">Your next keeper</span>
        <h1 className={s.title}>Start with what you know.</h1>
        <p className="lede">
          Your current gear. One thing to improve. A few candidates with the
          tradeoffs in plain sight.
        </p>
      </header>
      <SwitchGuide
        initialCurrent={typeof current === "string" ? current : ""}
        initialPriority={typeof priority === "string" ? priority : undefined}
        initialLine={typeof line === "string" ? line : undefined}
        initialSurface={typeof surface === "string" ? surface : undefined}
      />
    </div>
  );
}
