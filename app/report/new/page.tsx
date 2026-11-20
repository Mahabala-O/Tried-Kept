import type { Metadata } from "next";
import ReportForm from "@/components/ReportForm";
import { redirect } from "next/navigation";
import { ProductImage } from "@/components/MediaFrame";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel, products } from "@/lib/catalog";
import { OUTCOMES, REPORT_LIMITS, SURFACES } from "@/lib/reports";
import styles from "./new.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report your gear" };

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string | string[];
    from?: string | string[];
  }>;
}) {
  const { product, from } = await searchParams;
  const initialProduct =
    typeof product === "string" && getProduct(product) ? product : "";

  const previous = typeof from === "string" ? getProduct(from) : undefined;
  const selected = getProduct(initialProduct);
  const initialSwitchedFrom =
    previous &&
    selected &&
    previous.category === selected.category &&
    previous.slug !== selected.slug
      ? previous.slug
      : "";
  const user = await currentUser();
  if (!user) {
    const query = new URLSearchParams();
    if (initialProduct) query.set("product", initialProduct);
    if (initialSwitchedFrom) query.set("from", initialSwitchedFrom);
    const back = `/report/new${query.size ? `?${query}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(back)}`);
  }

  // Each thumbnail is the exact model's photo when lib/media.ts has one, otherwise labeled art.
  const previews = Object.fromEntries(
    products.map((p) => [
      p.slug,
      <ProductImage key={p.slug} product={p} ratio="1 / 1">
        <p className={styles.previewName}>{productLabel(p)}</p>
      </ProductImage>,
    ]),
  );

  return (
    <div className="wrap page">
      <header className={styles.head}>
        <span className="eyebrow">Tried it</span>
        <h1 className={styles.title}>
          Report your <span className={styles.word}>gear</span>
        </h1>
        <p className="lede">
          Say what you tried, what happened and why. Returned and rejected gear
          is as useful to the next player as gear you kept.
        </p>
        <div className={styles.stickers} aria-hidden="true">
          <span className="sticker sticker-kept tilt-left">Kept</span>
          <span className="sticker sticker-returned tilt-right">Returned</span>
          <span className="sticker sticker-ink tilt-left">Rejected</span>
        </div>
      </header>
      <ReportForm
        products={products.map((p) => ({
          slug: p.slug,
          label: productLabel(p),
          category: p.category,
        }))}
        outcomes={OUTCOMES}
        surfaces={SURFACES}
        limits={REPORT_LIMITS}
        initialProduct={initialProduct}
        initialSwitchedFrom={initialSwitchedFrom}
        previews={previews}
      />
    </div>
  );
}
