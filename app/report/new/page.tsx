import type { Metadata } from "next";
import ReportForm from "@/components/ReportForm";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel, products } from "@/lib/catalog";
import { OUTCOMES, REPORT_LIMITS, rewardedProductSlugs, SURFACES } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report your gear" };

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const { product } = await searchParams;
  const initialProduct = typeof product === "string" && getProduct(product) ? product : "";

  const user = await currentUser();
  if (!user) {
    const back = initialProduct ? `/report/new?product=${encodeURIComponent(initialProduct)}` : "/report/new";
    redirect(`/login?next=${encodeURIComponent(back)}`);
  }

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Tried it</span>
        <h1>Report your gear</h1>
        <p className="lede">
          Say what you tried, what happened and why. Returned and rejected gear is as useful to the next player as
          gear you kept.
        </p>
      </div>
      <ReportForm
        products={products.map((p) => ({ slug: p.slug, label: productLabel(p), category: p.category }))}
        outcomes={OUTCOMES}
        surfaces={SURFACES}
        limits={REPORT_LIMITS}
        initialProduct={initialProduct}
        rewardedSlugs={rewardedProductSlugs(user.id)}
      />
    </div>
  );
}
