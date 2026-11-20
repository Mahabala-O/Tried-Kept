import { redirect } from "next/navigation";
export default async function LegacyDiscovery({
  searchParams,
}: {
  searchParams: Promise<{ pro?: string; category?: string }>;
}) {
  const { pro, category } = await searchParams;
  if (typeof pro === "string") {
    const { getPro } = await import("@/lib/catalog");
    if (getPro(pro)) redirect(`/pros/${pro}`);
  }
  redirect(
    category === "shoe" || category === "racquet"
      ? `/gear?category=${category}`
      : "/gear",
  );
}
