import type { Metadata } from "next";
import { COLORS } from "@/components/art/palette";
import ShoeArt from "@/components/art/ShoeArt";
import GearMatch from "@/components/GearMatch";
import GameHeader from "../GameHeader";

export const metadata: Metadata = {
  title: "Gear Match",
  description: "Answer six questions and see which tennis shoes fit, why, and what is still unknown.",
};

export default async function GearMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] }>;
}) {
  const { resume } = await searchParams;

  return (
    <>
      <GameHeader
        title="Gear Match"
        lede="Six quick questions. We rank shoes only on facts we have checked and show you what is missing."
        tone="hardcourt"
        art={
          <ShoeArt
            seed="play-gear-match"
            main={COLORS.paper}
            accent={COLORS.clay}
            detail={COLORS.hardcourt}
            base={COLORS.optic}
            lace={COLORS.ink}
          />
        }
      />
      <div className="wrap page">
        <GearMatch resume={resume === "1"} />
      </div>
    </>
  );
}
