import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProImage, ProductImage } from "@/components/MediaFrame";
import GearEvidence from "@/components/GearEvidence";
import { formatDate, SourceLink } from "@/components/ui";
import { getPro, getProduct, productLabel } from "@/lib/catalog";
import { gearStories, EDITORIAL_CHECKED } from "@/lib/editorial";
import s from "@/components/journeys.module.css";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = gearStories.find((s) => s.slug === slug);
  return story
    ? { title: story.title, description: story.dek }
    : { title: "Story not found" };
}
export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = gearStories.find((s) => s.slug === slug);
  if (!story) notFound();
  const pro = getPro(story.proSlug)!;
  return (
    <article className={`wrap page ${s.article}`}>
      <Link href="/stories" className="tap-link">
        All gear stories
      </Link>
      <header className={s.intro}>
        <span className="eyebrow">{pro.name} · Historical gear story</span>
        <h1 className={s.title}>{story.title}</h1>
        <p className="lede">{story.dek}</p>
        <p className="small muted">
          Reported {formatDate(story.publishedOn)} · Sources checked{" "}
          {formatDate(EDITORIAL_CHECKED)}
        </p>
      </header>
      <ProImage
        slug={pro.slug}
        ratio="16 / 10"
        note="Player portrait; not evidence of the shoes worn during this historical trial."
      />
      <dl className={s.change}>
        <div>
          <dt>Started with</dt>
          <dd>{story.before}</dd>
        </div>
        <div>
          <dt>Tried</dt>
          <dd>{story.after}</dd>
        </div>
      </dl>
      <ol className={s.steps}>
        {story.steps.map((step) => (
          <li key={step.label} className={s.step}>
            <h2>{step.label}</h2>
            <p>{step.text}</p>
            <SourceLink source={step.source} standalone />
          </li>
        ))}
      </ol>
      <aside className="callout">
        <h2>Take it to your own court</h2>
        <p>{story.lesson}</p>
        <p className="small muted">{story.limitation}</p>
      </aside>
      {story.productSlugs.map((slug) => {
        const p = getProduct(slug);
        return p ? (
          <section key={slug} className="stack-lg">
            <h2>A retail model to explore</h2>
            <ProductImage product={p} ratio="1 / 1">
              <h3>
                <Link href={`/gear/${slug}`}>{productLabel(p)}</Link>
              </h3>
              <p className="small muted">
                Retail information is separate from this historical pro story.
              </p>
            </ProductImage>
            <GearEvidence productSlug={slug} />
          </section>
        ) : null;
      })}
      <div className="cta-row">
        <Link href={`/pros/${pro.slug}`} className="btn">
          Explore {pro.name.split(" ")[0]}’s dated bag
        </Link>
        <Link
          href={`/switch${story.productSlugs[0] ? `?current=${story.productSlugs[0]}` : ""}`}
          className="btn btn-primary"
        >
          Plan your own switch
        </Link>
      </div>
    </article>
  );
}
