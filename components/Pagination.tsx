import Link from "next/link";

export default function Pagination({
  page,
  pages,
  href,
  label,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
  label: string;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label={label} className="row">
      {page > 1 && (
        <Link className="btn" href={href(page - 1)} rel="prev">
          ← Previous page
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
        n === page ? (
          <span
            key={n}
            className="chip chip-active"
            aria-current="page"
            aria-label={`Page ${n}, current page`}
          >
            {n}
          </span>
        ) : (
          <Link
            key={n}
            className="chip"
            href={href(n)}
            aria-label={`Page ${n}`}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages && (
        <Link className="btn" href={href(page + 1)} rel="next">
          Next page →
        </Link>
      )}
    </nav>
  );
}
