import Link from "next/link";
import AddToLockerForm from "@/app/me/_components/AddToLockerForm";
import { isLockerStatus, type LockerStatus } from "@/app/me/_shared";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import { getDb } from "@/lib/db";

export default async function AddToLocker({ productSlug }: { productSlug: string }) {
  const product = getProduct(productSlug);
  if (!product) return null;

  const user = await currentUser();

  if (!user) {
    return (
      <div className="card">
        <h3>Your locker</h3>
        <p className="small muted">Join to keep track of {productLabel(product)} and share what you learn.</p>
        <div className="row">
          <Link href={`/signup?next=${encodeURIComponent(`/gear/${product.slug}`)}`} className="btn btn-primary">
            Join to add this
          </Link>
          <Link href={`/login?next=${encodeURIComponent(`/gear/${product.slug}`)}`} className="btn">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const row = getDb()
    .prepare("SELECT status FROM locker_items WHERE user_id = ? AND product_slug = ?")
    .get(user.id, product.slug) as { status: string } | undefined;
  const currentStatus: LockerStatus | null = row && isLockerStatus(row.status) ? row.status : null;

  return (
    <div className="card">
      <h3>Your locker</h3>
      <AddToLockerForm productSlug={product.slug} currentStatus={currentStatus} />
    </div>
  );
}
