import type { Metadata } from "next";
import Link from "next/link";
import CostCalculator from "@/components/CostCalculator";

export const metadata: Metadata = {
  title: "Court Cost",
  description: "Compare two pairs of tennis shoes by cost per hour and find the break-even point.",
};

export default function CourtCostPage() {
  return (
    <div className="wrap page">
      <header className="stack">
        <Link href="/play" className="small tap-link">
          Back to games
        </Link>
        <h1>Court Cost</h1>
        <p className="lede">A pricier pair can cost less per hour if it lasts longer. See how much longer it needs to last.</p>
      </header>
      <CostCalculator />
    </div>
  );
}
