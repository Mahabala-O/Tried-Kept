import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProfile } from "@/app/me/_data";
import { USERNAME_PATTERN } from "@/app/me/_shared";
import ReportCard from "@/components/ReportCard";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import { levelFor } from "@/lib/gamification";
import {
  countReports,
  isOutcome,
  isSurface,
  leaderboard,
  listReports,
  OUTCOMES,
  SURFACES,
  type ReportFilters,
} from "@/lib/reports";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community" };

const PAGE_SIZE = 20;
const WIDTH_MAX = 40;

type Query = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export default async function CommunityPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const viewer = await currentUser();
  const viewerId = viewer?.id ?? null;

  const outcome = one(query.outcome);
  const surface = one(query.surface);
  const width = one(query.width).slice(0, WIDTH_MAX);
  const product = getProduct(one(query.product));
  const playerName = one(query.player).toLowerCase();
  const player = USERNAME_PATTERN.test(playerName) ? getPublicProfile(playerName) : null;
  const offsetText = one(query.offset);
  const parsedOffset = /^\d{1,9}$/.test(offsetText) ? Number(offsetText) : 0;

  const filters: ReportFilters = {
    outcome: isOutcome(outcome) ? outcome : undefined,
    surface: isSurface(surface) ? surface : undefined,
    width: width || undefined,
    productSlug: product?.slug,
    userId: player?.id,
  };
  const hasFilters = Boolean(
    filters.outcome || filters.surface || filters.width || filters.productSlug || player,
  );

  const total = countReports(filters);
  const reports = listReports({ ...filters, limit: PAGE_SIZE, offset: parsedOffset, viewerId });
  const board = leaderboard(10);

  const pageHref = (offset: number) => {
    const params = new URLSearchParams();
    if (filters.outcome) params.set("outcome", filters.outcome);
    if (filters.surface) params.set("surface", filters.surface);
    if (filters.width) params.set("width", filters.width);
    if (filters.productSlug) params.set("product", filters.productSlug);
    if (player) params.set("player", player.username);
    if (offset > 0) params.set("offset", String(offset));
    const search = params.toString();
    return search ? `/community?${search}` : "/community";
  };

  const hasNewer = parsedOffset > 0;
  const hasOlder = parsedOffset + PAGE_SIZE < total;

  return (
    <div className="wrap page">
      <div className="stack">
        <span className="eyebrow">Community</span>
        <h1>What players tried and kept</h1>
        <p className="lede">
          Member reports on what they tried, kept or returned. Each gives a reason. Size, surface and hours are optional,
          and we do not verify purchases.
        </p>
        <div className="row">
          <Link href="/report/new" className="btn btn-primary">
            Report your gear
          </Link>
        </div>
      </div>

      <div className="split">
        <div className="stack-lg">
          <form
            key={`${filters.outcome ?? ""}|${filters.surface ?? ""}|${filters.width ?? ""}|${filters.productSlug ?? ""}|${player?.username ?? ""}`}
            method="get"
            action="/community"
            className="card"
            aria-label="Filter reports"
          >
            {product && <input type="hidden" name="product" value={product.slug} />}
            {player && <input type="hidden" name="player" value={player.username} />}
            <div className="grid">
              <div className="field">
                <label htmlFor="filter-outcome">Outcome</label>
                <select id="filter-outcome" name="outcome" defaultValue={filters.outcome ?? ""}>
                  <option value="">Any outcome</option>
                  {OUTCOMES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="filter-surface">Surface</label>
                <select id="filter-surface" name="surface" defaultValue={filters.surface ?? ""}>
                  <option value="">Any surface</option>
                  {SURFACES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="filter-width">Width</label>
                <input id="filter-width" name="width" maxLength={WIDTH_MAX} defaultValue={width} autoComplete="off" />
              </div>
            </div>
            <div className="row">
              <button type="submit" className="btn btn-primary">
                Apply filters
              </button>
              {hasFilters && (
                <Link href="/community" className="btn">
                  Clear filters
                </Link>
              )}
            </div>
            {product && <p className="small muted">Showing reports on {productLabel(product)}.</p>}
            {player && (
              <p className="small muted" style={{ overflowWrap: "anywhere" }}>
                Showing reports by {player.display_name} (@{player.username}).
              </p>
            )}
          </form>

          {total === 0 && !hasFilters && (
            <div className="callout">
              <p>No one has published a report yet. Be the first.</p>
              <div className="row">
                <Link href="/report/new" className="btn btn-primary">
                  Write the first report
                </Link>
              </div>
            </div>
          )}

          {total === 0 && hasFilters && (
            <div className="callout">
              <p>No reports match these filters yet.</p>
              <div className="row">
                <Link href="/community" className="btn">
                  See all reports
                </Link>
              </div>
            </div>
          )}

          {total > 0 && reports.length === 0 && (
            <div className="callout">
              <p>There are no reports on this page.</p>
              <div className="row">
                <Link href={pageHref(0)} className="btn">
                  Back to the latest reports
                </Link>
              </div>
            </div>
          )}

          {reports.length > 0 && (
            <div className="stack">
              <p className="small muted">
                Showing {parsedOffset + 1} to {parsedOffset + reports.length} of {total}{" "}
                {total === 1 ? "report" : "reports"}.
              </p>
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} viewerId={viewerId} />
              ))}
            </div>
          )}

          {reports.length > 0 && (hasNewer || hasOlder) && (
            <nav className="row between" aria-label="Report pages">
              {hasNewer ? (
                <Link href={pageHref(Math.max(0, parsedOffset - PAGE_SIZE))} className="btn">
                  Newer reports
                </Link>
              ) : (
                <span />
              )}
              {hasOlder && (
                <Link href={pageHref(parsedOffset + PAGE_SIZE)} className="btn">
                  Older reports
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="stack" aria-labelledby="leaderboard-heading">
          <h2 id="leaderboard-heading">Leaderboard</h2>
          <p className="small muted">XP rewards detail. It never depends on a positive verdict or a retailer click.</p>
          {board.length === 0 ? (
            <p className="muted">No one has earned XP yet.</p>
          ) : (
            <ol className="card" style={{ margin: 0, paddingLeft: 36 }}>
              {board.map((entry) => (
                <li key={entry.id} style={{ overflowWrap: "anywhere" }}>
                  <Link href={`/u/${encodeURIComponent(entry.username)}`} className="tap-link">
                    {entry.display_name}
                  </Link>
                  <br />
                  <span className="small muted">
                    @{entry.username} · {levelFor(entry.xp).name} · {entry.xp} XP
                  </span>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </div>
  );
}
