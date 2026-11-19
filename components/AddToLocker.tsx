import Link from "next/link";
import AddToLockerForm from "@/app/me/_components/AddToLockerForm";
import { isLockerStatus, type LockerStatus } from "@/app/me/_shared";
import styles from "@/app/me/me.module.css";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { XP } from "@/lib/gamification";

export default async function AddToLocker({ productSlug }: { productSlug: string }) {
  const product = getProduct(productSlug);
  if (!product) return null;

  const user = await currentUser();

  if (!user) {
    return (
      <div className={`card ${styles.addCard}`}>
        <div className={styles.addHead}>
          <h3>Your locker</h3>
          <span className="sticker sticker-xp sticker-sm tilt-right">Free to join</span>
        </div>
        <p className="small muted">Join to keep track of {productLabel(product)} and share what you learn.</p>
        <div className="cta-row">
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

  const db = getDb();
  const row = db
    .prepare("SELECT status FROM locker_items WHERE user_id = ? AND product_slug = ?")
    .get(user.id, product.slug) as { status: string } | undefined;
  const currentStatus: LockerStatus | null = row && isLockerStatus(row.status) ? row.status : null;
  // XP for a model is paid once, so only promise it when it has not been paid before.
  const xpPaid = Boolean(
    db.prepare("SELECT 1 FROM xp_events WHERE user_id = ? AND event_key = ?").get(user.id, `locker:${product.slug}`),
  );

  return (
    <div className={`card ${styles.addCard}`}>
      <div className={styles.addHead}>
        <h3>Your locker</h3>
        {currentStatus ? (
          <span className="sticker sticker-kept sticker-sm tilt-right">In your locker</span>
        ) : (
          !xpPaid && <span className="sticker sticker-xp sticker-sm tilt-right">+{XP.lockerItem} XP</span>
        )}
      </div>
      <AddToLockerForm productSlug={product.slug} currentStatus={currentStatus} />
    </div>
  );
}
