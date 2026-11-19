import type { Metadata } from "next";
import Link from "next/link";
import ShareProfile from "@/components/ShareProfile";
import UserReports from "@/components/UserReports";
import { GapNote, XpBar } from "@/components/ui";
import { logoutAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth";
import { productLabel, products } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { XP, badgesFor, levelFor, totalXp } from "@/lib/gamification";
import AccountSettings from "./_components/AccountSettings";
import { LockerItemCard } from "./_components/LockerItemCard";
import ProfileForm from "./_components/ProfileForm";
import QuickAddForm, { type QuickAddGroup } from "./_components/QuickAddForm";
import { getLocker } from "./_data";
import { LOCKER_STATUSES } from "./_shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My locker", robots: { index: false } };

function quickAddGroups(owned: Set<string>): QuickAddGroup[] {
  const optionsFor = (category: "shoe" | "racquet") =>
    products
      .filter((p) => p.category === category && !owned.has(p.slug))
      .map((p) => ({ slug: p.slug, label: productLabel(p) }));

  return [
    { label: "Shoes", options: optionsFor("shoe") },
    { label: "Racquets", options: optionsFor("racquet") },
  ].filter((group) => group.options.length > 0);
}

export default async function MePage() {
  const user = await requireUser();
  const db = getDb();

  const xp = totalXp(db, user.id);
  const level = levelFor(xp);
  const badges = badgesFor(db, user.id);
  const locker = getLocker(user.id);
  const groups = quickAddGroups(new Set(locker.map((item) => item.product_slug)));

  const profileBonusPaid = Boolean(
    db.prepare("SELECT 1 FROM xp_events WHERE user_id = ? AND event_key = 'profile:complete'").get(user.id),
  );

  return (
    <div className="wrap page">
      <header className="stack">
        <span className="eyebrow">My locker</span>
        <h1 style={{ overflowWrap: "anywhere" }}>{user.display_name}</h1>
        <p className="muted">@{user.username}</p>
        <div className="row">
          <Link href={`/u/${user.username}`} className="btn">
            View public profile
          </Link>
          <ShareProfile username={user.username} displayName={user.display_name} />
          <form action={logoutAction}>
            <button type="submit" className="btn">
              Log out
            </button>
          </form>
        </div>
      </header>

      <section className="card" aria-labelledby="level-heading">
        <div className="row between">
          <h2 id="level-heading">{level.name}</h2>
          <span className="tag">{xp} XP</span>
        </div>
        <XpBar progress={level.progress} label="Progress to the next level" />
        <p className="small muted">
          {level.next ? `${level.next.minXp - xp} XP to ${level.next.name}.` : "You have reached the top level."} XP
          rewards useful detail. It never depends on a positive review or a retailer click.
        </p>
      </section>

      <div className="split">
        <div className="stack-lg">
          <section className="stack-lg" aria-labelledby="locker-heading">
            <h2 id="locker-heading">Your gear</h2>

            {locker.length === 0 ? (
              <div className="card">
                <h3>Start with what is in your bag</h3>
                <p>
                  Your locker is empty. Add the shoes or racquet you play with now, then see how they compare and log
                  what you learn.
                </p>
                <QuickAddForm groups={groups} />
                <GapNote>
                  The catalog holds {products.length} models so far, so yours may not be listed yet.
                </GapNote>
                <p className="small muted">Not sure where to begin?</p>
                <div className="row">
                  <Link href="/pros" className="btn">
                    Start from a pro
                  </Link>
                  <Link href="/gear" className="btn">
                    Browse gear
                  </Link>
                  <Link href="/play/finder" className="btn">
                    Find a match
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {LOCKER_STATUSES.map((status) => {
                  const items = locker.filter((item) => item.status === status.value);
                  return (
                    <div className="stack" key={status.value}>
                      <h3>
                        {status.label} ({items.length})
                      </h3>
                      {items.length === 0 ? (
                        <p className="small muted">Nothing here yet.</p>
                      ) : (
                        items.map((item) => <LockerItemCard key={item.id} item={item} />)
                      )}
                    </div>
                  );
                })}

                {groups.length > 0 && (
                  <div className="card">
                    <h3>Add another item</h3>
                    <QuickAddForm groups={groups} />
                  </div>
                )}
              </>
            )}
          </section>

          <UserReports userId={user.id} />
        </div>

        <div className="stack-lg">
          <section className="stack" aria-labelledby="badges-heading">
            <h2 id="badges-heading">Badges</h2>
            {badges.map((badge) => (
              <div key={badge.id} className={badge.earned ? "badge badge-earned" : "badge"}>
                <strong>{badge.name}</strong>
                <span className="small">{badge.description}</span>
                <span className="small">{badge.earned ? "Earned" : "Not earned yet"}</span>
              </div>
            ))}
          </section>

          <section className="stack" aria-labelledby="profile-heading">
            <h2 id="profile-heading">Profile</h2>
            {!profileBonusPaid && (
              <p className="small muted">
                Add a bio, home surface, play level and weekly hours to earn {XP.profileComplete} XP once.
              </p>
            )}
            <ProfileForm
              values={{
                displayName: user.display_name,
                bio: user.bio,
                homeSurface: user.home_surface,
                playLevel: user.play_level,
                weeklyHours: user.weekly_hours,
              }}
            />
          </section>

          <section className="stack" aria-labelledby="account-heading">
            <h2 id="account-heading">Account</h2>
            <AccountSettings />
            <p className="small muted">
              <Link href="/privacy">How we handle your data</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
