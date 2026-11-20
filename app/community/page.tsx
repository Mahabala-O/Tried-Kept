import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProfile } from "@/app/me/_data";
import { USERNAME_PATTERN } from "@/app/me/_shared";
import { BallArt } from "@/components/art";
import ReportCard from "@/components/ReportCard";
import { currentUser } from "@/lib/auth";
import { getProduct, productLabel } from "@/lib/catalog";
import {
  countReports,
  isOutcome,
  isSurface,
  listReports,
  OUTCOMES,
  SURFACES,
  type Outcome,
  type ReportFilters,
  type Surface,
} from "@/lib/reports";
import styles from "./community.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community" };

const PAGE_SIZE = 20;
const WIDTH_MAX = 40;

type Query = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

type Current = {
  outcome?: Outcome;
  surface?: Surface;
  width?: string;
  product?: string;
  player?: string;
};

/** Builds a /community link from the current filters plus any changes. Filters always reset the page. */
function hrefFor(current: Current, changes: Partial<Record<keyof Current, string | undefined>> = {}, offset = 0): string {
  const next = { ...current, ...changes };
  const params = new URLSearchParams();
  if (next.outcome) params.set("outcome", next.outcome);
  if (next.surface) params.set("surface", next.surface);
  if (next.width) params.set("width", next.width);
  if (next.product) params.set("product", next.product);
  if (next.player) params.set("player", next.player);
  if (offset > 0) params.set("offset", String(offset));
  const search = params.toString();
  return search ? `/community?${search}` : "/community";
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
  const allReports = hasFilters ? countReports({}) : total;
  const reports = listReports({ ...filters, limit: PAGE_SIZE, offset: parsedOffset, viewerId });

  const current: Current = {
    outcome: filters.outcome,
    surface: filters.surface,
    width: filters.width,
    product: filters.productSlug,
    player: player?.username,
  };
  const pageHref = (offset: number) => hrefFor(current, {}, offset);

  const hasNewer = parsedOffset > 0;
  const hasOlder = parsedOffset + PAGE_SIZE < total;

  return (
    <div className="wrap page">
      <header className={styles.hero}>
        <BallArt className={styles.heroBall} />
        <span className="eyebrow">Community</span>
        <h1 className={styles.heroTitle}>
          What players tried and <em>kept</em>
        </h1>
        <p className="lede">
          Member reports on what they tried, kept or returned. Each gives a reason. Size, surface and hours are optional,
          and we do not verify purchases.
        </p>
        <div className={styles.heroStickers}>
          {allReports > 0 ? (
            <span className="sticker sticker-paper tilt-left">
              {allReports} {allReports === 1 ? "report" : "reports"}
            </span>
          ) : (
            <span className="sticker sticker-paper tilt-left">Be the first</span>
          )}
          <span className="sticker sticker-ink tilt-right">Returns count too</span>
        </div>
        <div className="cta-row">
          <Link href="/report/new" className="btn btn-primary btn-lg">
            Report your gear
          </Link>

        </div>
      </header>

      <div className="stack-lg">
        <div className="stack-lg">
          <section className={styles.filters} aria-label="Filter reports">
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel} id="filter-outcome-label">
                Outcome
              </span>
              <ul className={`chip-scroll ${styles.chips}`} aria-labelledby="filter-outcome-label">
                <li>
                  <Link
                    href={hrefFor(current, { outcome: undefined })}
                    className="chip"
                    aria-current={filters.outcome ? undefined : "true"}
                  >
                    <span className={`${styles.chipDot} ${styles.dot_any}`} aria-hidden="true" />
                    Any outcome
                  </Link>
                </li>
                {OUTCOMES.map((o) => (
                  <li key={o.value}>
                    <Link
                      href={hrefFor(current, { outcome: o.value })}
                      className="chip"
                      aria-current={filters.outcome === o.value ? "true" : undefined}
                    >
                      <span className={`${styles.chipDot} ${styles[`dot_${o.value}`]}`} aria-hidden="true" />
                      {o.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel} id="filter-surface-label">
                Surface
              </span>
              <ul className={`chip-scroll ${styles.chips}`} aria-labelledby="filter-surface-label">
                <li>
                  <Link
                    href={hrefFor(current, { surface: undefined })}
                    className="chip"
                    aria-current={filters.surface ? undefined : "true"}
                  >
                    Any surface
                  </Link>
                </li>
                {SURFACES.map((s) => (
                  <li key={s.value}>
                    <Link
                      href={hrefFor(current, { surface: s.value })}
                      className="chip"
                      aria-current={filters.surface === s.value ? "true" : undefined}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <form
              key={`${filters.outcome ?? ""}|${filters.surface ?? ""}|${filters.width ?? ""}|${filters.productSlug ?? ""}|${player?.username ?? ""}`}
              method="get"
              action="/community"
              className={styles.widthForm}
              role="search"
              aria-label="Filter by shoe width"
            >
              {filters.outcome && <input type="hidden" name="outcome" value={filters.outcome} />}
              {filters.surface && <input type="hidden" name="surface" value={filters.surface} />}
              {product && <input type="hidden" name="product" value={product.slug} />}
              {player && <input type="hidden" name="player" value={player.username} />}
              <div className="field">
                <label htmlFor="filter-width">Width</label>
                <input
                  id="filter-width"
                  name="width"
                  maxLength={WIDTH_MAX}
                  defaultValue={width}
                  autoComplete="off"
                  placeholder="Such as wide or 2E"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Apply
              </button>
            </form>

            {hasFilters && (
              <div className={styles.active}>
                <span className="sr-only">Active filters:</span>
                {product && (
                  <Link href={hrefFor(current, { product: undefined })} className={styles.activeChip}>
                    <span>Model: {productLabel(product)}</span>
                    <span className={styles.activeX} aria-hidden="true">
                      &times;
                    </span>
                    <span className="sr-only">, remove</span>
                  </Link>
                )}
                {player && (
                  <Link href={hrefFor(current, { player: undefined })} className={styles.activeChip}>
                    <span>
                      By {player.display_name} (@{player.username})
                    </span>
                    <span className={styles.activeX} aria-hidden="true">
                      &times;
                    </span>
                    <span className="sr-only">, remove</span>
                  </Link>
                )}
                {filters.width && (
                  <Link href={hrefFor(current, { width: undefined })} className={styles.activeChip}>
                    <span>Width: {filters.width}</span>
                    <span className={styles.activeX} aria-hidden="true">
                      &times;
                    </span>
                    <span className="sr-only">, remove</span>
                  </Link>
                )}
                <Link href="/community" className={`btn ${styles.clearAll}`}>
                  Clear filters
                </Link>
              </div>
            )}
          </section>

          {total === 0 && !hasFilters && (
            <div className={`callout ${styles.empty}`}>
              <BallArt bounce className={styles.emptyBall} />
              <div className="stack">
                <p>No one has published a report yet. Be the first.</p>
                <div className="cta-row">
                  <Link href="/report/new" className="btn btn-primary">
                    Write the first report
                  </Link>
                </div>
              </div>
            </div>
          )}

          {total === 0 && hasFilters && (
            <div className={`callout ${styles.empty}`}>
              <BallArt className={styles.emptyBall} />
              <div className="stack">
                <p>No reports match these filters yet.</p>
                <div className="cta-row">
                  <Link href="/community" className="btn">
                    See all reports
                  </Link>
                </div>
              </div>
            </div>
          )}

          {total > 0 && reports.length === 0 && (
            <div className="callout">
              <p>There are no reports on this page.</p>
              <div className="cta-row">
                <Link href={pageHref(0)} className="btn">
                  Back to the latest reports
                </Link>
              </div>
            </div>
          )}

          {reports.length > 0 && (
            <div className="stack">
              <div className={styles.resultsHead}>
                <p className={styles.count}>
                  {total} {total === 1 ? "report" : "reports"}
                </p>
                <p className="small muted">
                  Showing {parsedOffset + 1} to {parsedOffset + reports.length} of {total}{" "}
                  {total === 1 ? "report" : "reports"}.
                </p>
              </div>
              <div className={styles.list}>
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} viewerId={viewerId} />
                ))}
              </div>
            </div>
          )}

          {reports.length > 0 && (hasNewer || hasOlder) && (
            <nav className={styles.pager} aria-label="Report pages">
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


      </div>
    </div>
  );
}
