import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockerFacts } from "@/app/me/_components/LockerFacts";
import PlayerCard from "@/app/me/_components/PlayerCard";
import { getPublicLocker, getPublicProfile } from "@/app/me/_data";
import { LOCKER_STATUSES, PLAY_LEVELS, SURFACES, USERNAME_PATTERN, labelFor } from "@/app/me/_shared";
import styles from "@/app/me/me.module.css";
import { ProductImage } from "@/components/MediaFrame";
import ShareProfile from "@/components/ShareProfile";
import UserReports from "@/components/UserReports";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import { countReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }> };

const STATUS_STICKER = { using: "sticker-kept", retired: "sticker-paper", want: "sticker-blue" } as const;

function loadProfile(raw: string) {
  const username = raw.toLowerCase();
  return USERNAME_PATTERN.test(username) ? getPublicProfile(username) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = loadProfile(username);
  if (!profile) return { title: "Player not found" };
  return {
    title: `${profile.display_name} (@${profile.username})`,
    description: `The gear ${profile.display_name} uses, retired and wants to try.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = loadProfile(username);
  if (!profile) notFound();

  // Only public columns: no price paid, no notes.
  const locker = getPublicLocker(profile.id);
  const reportCount = countReports({ userId: profile.id });
  const viewer = await currentUser();
  const isOwner = viewer?.id === profile.id;

  const surface = labelFor(SURFACES, profile.home_surface);
  const playLevel = labelFor(PLAY_LEVELS, profile.play_level);

  return (
    <div className="wrap page">
      <div className={styles.profileLayout}>
        <div className={styles.cardColumn}>
          <span className="eyebrow">Player card</span>
          <PlayerCard
            layout="portrait"
            displayName={profile.display_name}
            username={profile.username}
            surface={profile.home_surface}
            stats={[
              { label: locker.length === 1 ? "Item" : "Items", value: locker.length },
              { label: reportCount === 1 ? "Report" : "Reports", value: reportCount },
            ]}
          >
            <p className={`${styles.bio} ${profile.bio ? "" : "muted"}`}>{profile.bio || "No bio yet."}</p>
            <div className={styles.facts}>
              <span className="tag">{surface ? `${surface} courts` : "Home surface not set"}</span>
              <span className="tag">{playLevel ?? "Play level not set"}</span>
            </div>
            <div className={styles.actions}>
              <ShareProfile
                username={profile.username}
                displayName={profile.display_name}
                className="btn btn-optic"
              />
              {isOwner && (
                <Link href="/me" className="btn">
                  Edit my locker
                </Link>
              )}
            </div>
          </PlayerCard>
        </div>

        <div className="stack-lg">
          <section className="stack-lg" aria-labelledby="locker-heading">
            <h2 id="locker-heading">In the bag</h2>
            {locker.length === 0 ? (
              <p className={`small ${styles.emptyGroup}`}>Nothing in this locker yet.</p>
            ) : (
              LOCKER_STATUSES.map((status) => {
                const items = locker.filter((item) => item.status === status.value);
                if (items.length === 0) return null;
                return (
                  <div className="stack" key={status.value}>
                    <h3 className={styles.groupHead}>
                      {status.label}
                      <span className={styles.count}>{items.length}</span>
                    </h3>
                    <div className={styles.lockerGrid}>
                      {items.map((item) => {
                        const product = getProduct(item.product_slug);
                        return (
                          <article className={`card ${styles.item}`} key={item.id}>
                            {product && <ProductImage product={product} ratio="16 / 10" />}
                            <div className={styles.itemBody}>
                              <div className={styles.itemTitle}>
                                <h4>
                                  {product ? (
                                    <Link href={`/gear/${product.slug}`}>{productLabel(product)}</Link>
                                  ) : (
                                    <span className="muted">Model no longer listed</span>
                                  )}
                                </h4>
                                <span className={`sticker sticker-sm ${STATUS_STICKER[item.status]} tilt-right`}>
                                  {status.label}
                                </span>
                              </div>
                              <LockerFacts item={item} />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <UserReports userId={profile.id} />
        </div>
      </div>
    </div>
  );
}
