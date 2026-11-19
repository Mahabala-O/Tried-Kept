import type { Metadata } from "next";
import Link from "next/link";
import GearMatch from "@/components/GearMatch";

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
    <div className="wrap page">
      <header className="stack">
        <Link href="/play" className="small tap-link">
          Back to games
        </Link>
        <h1>Gear Match</h1>
        <p className="lede">Six quick questions. We rank shoes only on facts we have checked and show you what is missing.</p>
      </header>
      <GearMatch resume={resume === "1"} />
    </div>
  );
}
