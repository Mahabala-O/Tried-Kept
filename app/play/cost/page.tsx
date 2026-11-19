import type { Metadata } from "next";
import CourtArt from "@/components/art/CourtArt";
import CostCalculator from "@/components/CostCalculator";
import GameHeader from "../GameHeader";

export const metadata: Metadata = {
  title: "Court Cost",
  description: "Compare two pairs of tennis shoes by cost per hour and find the break-even point.",
};

export default function CourtCostPage() {
  return (
    <>
      <GameHeader
        title="Court Cost"
        lede="A pricier pair can cost less per hour if it lasts longer. See how much longer it needs to last."
        tone="grass"
        art={<CourtArt variant="hard" />}
      />
      <div className="wrap page">
        <CostCalculator />
      </div>
    </>
  );
}
