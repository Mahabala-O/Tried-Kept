import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="stack">
        <h1>We could not find that page</h1>
        <p className="lede">The link may be out of date. These pages are a good place to pick up from.</p>
      </div>
      <div className="row">
        <Link href="/gear" className="btn btn-primary">
          Browse gear
        </Link>
        <Link href="/pros" className="btn">
          Browse pros
        </Link>
        <Link href="/compare" className="btn">
          See comparisons
        </Link>
      </div>
    </div>
  );
}
