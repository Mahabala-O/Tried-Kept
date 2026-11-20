import Link from "next/link";
import AddToLockerForm from "@/app/me/_components/AddToLockerForm";
import { isLockerStatus, type LockerStatus } from "@/app/me/_shared";
import styles from "@/app/me/me.module.css";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import { mailReady } from "@/lib/mail";
import { getDb } from "@/lib/db";

export default async function AddToLocker({
  productSlug,
  returnPath,
}: {
  productSlug: string;
  returnPath?: string;
}) {
  const product = getProduct(productSlug);
  if (!product) return null;

  const destination = returnPath ?? `/gear/${product.slug}`;
  const user = await currentUser();

  if (!user) {
    const signupsOpen = mailReady();
    return (
      <div className={`card ${styles.addCard}`}>
        <div className={styles.addHead}>
          <h3>Your locker</h3>
          {signupsOpen && (
            <span className="sticker sticker-paper sticker-sm tilt-right">
              Free to join
            </span>
          )}
        </div>
        <p className="small muted">
          Keep track of {productLabel(product)} and share what you learn.
        </p>
        {!signupsOpen && (
          <p className="small muted">
            New accounts are temporarily paused. Existing players can still log
            in.
          </p>
        )}
        <div className="cta-row">
          {signupsOpen && (
            <Link
              href={`/signup?next=${encodeURIComponent(destination)}`}
              className="btn btn-primary"
            >
              Join to add this
            </Link>
          )}
          <Link
            href={`/login?next=${encodeURIComponent(destination)}`}
            className="btn"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const db = getDb();
  const row = db
    .prepare(
      "SELECT status FROM locker_items WHERE user_id = ? AND product_slug = ?",
    )
    .get(user.id, product.slug) as { status: string } | undefined;
  const currentStatus: LockerStatus | null =
    row && isLockerStatus(row.status) ? row.status : null;

  return (
    <div className={`card ${styles.addCard}`}>
      <div className={styles.addHead}>
        <h3>Your locker</h3>
        {currentStatus ? (
          <span className="sticker sticker-kept sticker-sm tilt-right">
            In your locker
          </span>
        ) : null}
      </div>
      <AddToLockerForm
        productSlug={product.slug}
        currentStatus={currentStatus}
      />
    </div>
  );
}
