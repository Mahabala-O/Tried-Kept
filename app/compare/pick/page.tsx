import { permanentRedirect } from "next/navigation";
export default async function LegacyPicker({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const { left, right } = await searchParams;
  const query = new URLSearchParams();
  if (typeof left === "string") query.set("left", left);
  if (typeof right === "string") query.set("right", right);
  permanentRedirect(`/gear/compare${query.size ? `?${query}` : ""}`);
}
