import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockerFacts } from "@/app/me/_components/LockerFacts";
import { getPublicLocker, getPublicProfile } from "@/app/me/_data";
import { LOCKER_STATUSES, PLAY_LEVELS, SURFACES, USERNAME_PATTERN, labelFor } from "@/app/me/_shared";
import ShareProfile from "@/components/ShareProfile";
import UserReports from "@/components/UserReports";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { badgesFor, levelFor, totalXp } from "@/lib/gamification";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }> };

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

  const db = getDb();
  const xp = totalXp(db, profile.id);
  const level = levelFor(xp);
  const earned = badgesFor(db, profile.id).filter((badge) => badge.earned);
  const locker = getPublicLocker(profile.id);
  const viewer = await currentUser();
  const isOwner = viewer?.id === profile.id;

  const surface = labelFor(SURFACES, profile.home_surface);
  const playLevel = labelFor(PLAY_LEVELS, profile.play_level);

  return (
    <div className="wrap page">
      <header className="stack">
        <span className="eyebrow">Player profile</span>
        <h1 style={{ overflowWrap: "anywhere" }}>{profile.display_name}</h1>
        <p className="muted">@{profile.username}</p>
        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} className={profile.bio ? undefined : "muted"}>
          {profile.bio || "No bio yet."}
        </p>
        <div className="row">
          <span className="tag">{level.name}</span>
          <span className="tag">{xp} XP</span>
          <span className="tag">{surface ? `${surface} courts` : "Home surface not set"}</span>
          <span className="tag">{playLevel ?? "Play level not set"}</span>
        </div>
        <div className="row">
          <ShareProfile username={profile.username} displayName={profile.display_name} />
          {isOwner && (
            <Link href="/me" className="btn">
              Edit my locker
            </Link>
          )}
        </div>
      </header>

      <section className="stack-lg" aria-labelledby="locker-heading">
        <h2 id="locker-heading">Locker</h2>
        {locker.length === 0 ? (
          <p className="muted">Nothing in this locker yet.</p>
        ) : (
          LOCKER_STATUSES.map((status) => {
            const items = locker.filter((item) => item.status === status.value);
            if (items.length === 0) return null;
            return (
              <div className="stack" key={status.value}>
                <h3>{status.label}</h3>
                <div className="grid">
                  {items.map((item) => {
                    const product = getProduct(item.product_slug);
                    return (
                      <article className="card" key={item.id}>
                        {product ? (
                          <Link href={`/gear/${product.slug}`} className="tap-link">
                            {productLabel(product)}
                          </Link>
                        ) : (
                          <span className="muted">Model no longer listed</span>
                        )}
                        <LockerFacts item={item} />
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="stack" aria-labelledby="badges-heading">
        <h2 id="badges-heading">Badges</h2>
        {earned.length === 0 ? (
          <p className="muted">No badges earned yet.</p>
        ) : (
          <div className="grid">
            {earned.map((badge) => (
              <div key={badge.id} className="badge badge-earned">
                <strong>{badge.name}</strong>
                <span className="small">{badge.description}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <UserReports userId={profile.id} />
    </div>
  );
}
