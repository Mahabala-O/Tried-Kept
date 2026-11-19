import type { Metadata } from "next";
import Link from "next/link";
import { SourceLink, formatDate } from "@/components/ui";
import { RESEARCH_DATE, sources } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Disclosure",
  description: "How affiliate links, evidence, dates, points and lab data work on Tried & Kept.",
};

export default function DisclosurePage() {
  return (
    <div className="wrap page">
      <div className="stack">
        <h1>How this site works</h1>
        <p className="lede">How we make money, where our facts come from, and what they can and cannot tell you.</p>
      </div>

      <div className="stack-lg" style={{ maxWidth: "68ch" }}>
        <section className="stack" aria-labelledby="affiliate">
          <h2 id="affiliate">Affiliate links</h2>
          <p>
            Some links to retailers are affiliate links. If you buy something after using one, we may earn a commission
            at no cost to you.
          </p>
          <p>
            Retailer buttons say &ldquo;Check price at&rdquo; and the retailer&apos;s name. When you use one, we record which
            offer you chose, which part of the site you came from, and your account if you are logged in. Then we send you
            to the retailer.
          </p>
          <p>Gear Match ranks shoes only on the facts we hold. Commissions play no part in its results.</p>
        </section>

        <section className="stack" aria-labelledby="evidence">
          <h2 id="evidence">Evidence and dates</h2>
          <p>
            Catalog facts cover the U.S. market and were checked on {formatDate(RESEARCH_DATE)}. Prices can change after
            that date, and we do not confirm stock or size availability.
          </p>
          <p>
            When we do not have a fact, we label it as missing. We do not estimate it or fill it in from a similar model.
          </p>
          <p>
            Pro gear always appears with the date it was identified and the source. A pro may use a custom or different
            model from the retail version, and may have changed gear since that date.
          </p>
          <p>
            Forum replies are short accounts from individual players. Player reports on this site are written by members,
            and we do not verify their purchases. Treat both as one person&apos;s experience.
          </p>
        </section>

        <section className="stack" aria-labelledby="points">
          <h2 id="points">Points and badges</h2>
          <p>
            Points reward useful detail. A report on a pair you returned earns the same points as an equally detailed
            report on a pair you kept.
          </p>
          <p>You earn no points for a positive review, for clicking a retailer link or for buying anything.</p>
        </section>

        <section className="stack" aria-labelledby="lab-data">
          <h2 id="lab-data">Lab data</h2>
          <p>
            Weights and interior widths come from RunRepeat&apos;s lab. They describe the shoes it tested, so your size and
            width may measure differently. Use them to compare models, then confirm the fit on your own foot.
          </p>
          <SourceLink source={sources.rrMethods} standalone />
        </section>

        <section className="stack" aria-labelledby="your-data">
          <h2 id="your-data">Your data</h2>
          <p>
            <Link href="/privacy">Our privacy page</Link> covers what we store, how long we keep it and how to delete your
            account.
          </p>
        </section>
      </div>
    </div>
  );
}
