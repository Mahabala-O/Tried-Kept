import { redirect } from "next/navigation";
import { getProduct } from "@/lib/catalog";
export default async function LegacySwitch({
  searchParams,
}: {
  searchParams: Promise<{ current?: string }>;
}) {
  const { current } = await searchParams;
  redirect(
    typeof current === "string" && getProduct(current)
      ? `/gear/${current}`
      : "/gear",
  );
}
