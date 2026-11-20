import { notFound, permanentRedirect } from "next/navigation";
import { getComparison } from "@/lib/catalog";
import { comparisonHref } from "@/lib/navigation";
export default async function LegacyComparison({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getComparison(slug)) notFound();
  permanentRedirect(comparisonHref(slug));
}
