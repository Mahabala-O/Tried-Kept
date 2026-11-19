import type { Metadata } from "next";
import Link from "next/link";
import RacquetArt from "@/components/art/RacquetArt";
import ShoeArt from "@/components/art/ShoeArt";
import ShareProfile from "@/components/ShareProfile";
import UserReports from "@/components/UserReports";
import { GapNote } from "@/components/ui";
import { logoutAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth";
import { productLabel, products } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { XP, badgesFor, levelFor, totalXp } from "@/lib/gamification";
import { countReports } from "@/lib/reports";
import AccountSettings from "./_components/AccountSettings";
import BadgeSheet from "./_components/BadgeSheet";
import Drawer from "./_components/Drawer";
import { LockerItemCard } from "./_components/LockerItemCard";
import PlayerCard from "./_components/PlayerCard";
import ProfileForm from "./_components/ProfileForm";
import QuickAddForm, { type QuickAddGroup } from "./_components/QuickAddForm";
import { getLocker } from "./_data";
import { LOCKER_STATUSES } from "./_shared";
import styles from "./me.module.css";

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
  const earnedCount = badges.filter((badge) => badge.earned).length;
  const locker = getLocker(user.id);
  const reportCount = countReports({ userId: user.id });
  const groups = quickAddGroups(new Set(locker.map((item) => item.product_slug)));

  const profileBonusPaid = Boolean(
    db.prepare("SELECT 1 FROM xp_events WHERE user_id = ? AND event_key = 'profile:complete'").get(user.id),
  );

  return (
    <div className="wrap page">
      <PlayerCard
        displayName={user.display_name}
        username={user.username}
        level={level}
        xp={xp}
        surface={user.home_surface}
        stats={[
          { label: locker.length === 1 ? "Item" : "Items", value: locker.length },
          { label: reportCount === 1 ? "Report" : "Reports", value: reportCount },
          { label: `of ${badges.length} badges`, value: earnedCount },
        ]}
      >
        <p className={styles.xpNote}>
          XP rewards useful detail. It never depends on a positive review or a retailer click.
        </p>
        <div className={styles.actions}>
          <Link href={`/u/${user.username}`} className="btn btn-primary">
            View public profile
          </Link>
          <ShareProfile username={user.username} displayName={user.display_name} />
          <form action={logoutAction}>
            <button type="submit" className="btn">
              Log out
            </button>
          </form>
        </div>
      </PlayerCard>

      <div className="split">
        <div className="stack-lg">
          <section className="stack-lg" aria-labelledby="locker-heading">
            <div className={styles.sectionHead}>
              <h2 id="locker-heading">Your gear</h2>
              {locker.length > 0 && (
                <nav className={styles.statusChips} aria-label="Jump to a locker shelf">
                  {LOCKER_STATUSES.map((status) => (
                    <a key={status.value} href={`#shelf-${status.value}`} className="chip">
                      {status.label}
                      <span className={styles.count}>
                        {locker.filter((item) => item.status === status.value).length}
                      </span>
                    </a>
                  ))}
                </nav>
              )}
            </div>

            {locker.length === 0 ? (
              <div className={`card ${styles.empty}`}>
                <div className={styles.emptyArt} aria-hidden="true">
                  <ShoeArt seed="empty-locker" variant={1} />
                  <RacquetArt seed="empty-locker" tilt={-18} />
                </div>
                <h3>Start with what is in your bag</h3>
                <p>
                  Your locker is empty. Add the shoes or racquet you play with now, then see how they compare and log
                  what you learn.
                </p>
                <span className="sticker sticker-xp sticker-sm tilt-left">
                  +{XP.lockerItem} XP for each new model
                </span>
                <QuickAddForm groups={groups} />
                <GapNote>The catalog holds {products.length} models so far, so yours may not be listed yet.</GapNote>
                <p className="small muted">Not sure where to begin?</p>
                <div className="cta-row">
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
                    <div className="stack" key={status.value} id={`shelf-${status.value}`}>
                      <h3 className={styles.groupHead}>
                        {status.label}
                        <span className={styles.count}>{items.length}</span>
                      </h3>
                      {items.length === 0 ? (
                        <p className={`small ${styles.emptyGroup}`}>Nothing here yet.</p>
                      ) : (
                        <div className={styles.lockerGrid}>
                          {items.map((item) => (
                            <LockerItemCard key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {groups.length > 0 && (
                  <Drawer
                    title="Add another item"
                    hint="Pick a model from the catalog"
                    sticker={<span className="sticker sticker-xp sticker-sm tilt-right">+{XP.lockerItem} XP</span>}
                  >
                    <QuickAddForm groups={groups} />
                  </Drawer>
                )}
              </>
            )}
          </section>

          <UserReports userId={user.id} />
        </div>

        <div className={`stack-lg ${styles.aside}`}>
          <section className="stack" aria-labelledby="badges-heading">
            <div className={styles.sectionHead}>
              <h2 id="badges-heading">Badges</h2>
              <span className="sticker sticker-ink sticker-sm tilt-right">
                {earnedCount} of {badges.length}
              </span>
            </div>
            <BadgeSheet badges={badges} label="Your badges, earned and locked" />
          </section>

          <section className="stack" aria-labelledby="settings-heading">
            <h2 id="settings-heading">Settings</h2>
            <Drawer
              id="profile"
              title="Profile"
              hint={profileBonusPaid ? "Name, bio, surface and level" : "Fill it in for a one-time bonus"}
              sticker={
                profileBonusPaid ? undefined : (
                  <span className="sticker sticker-xp sticker-sm tilt-left">+{XP.profileComplete} XP</span>
                )
              }
            >
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
            </Drawer>

            <Drawer id="account" title="Account" hint="Password, devices and deleting your account">
              <AccountSettings />
              <p className="small muted">
                <Link href="/privacy">How we handle your data</Link>
              </p>
            </Drawer>
          </section>
        </div>
      </div>
    </div>
  );
}
