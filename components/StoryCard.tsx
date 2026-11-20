import Link from "next/link";
import { ProImage } from "./MediaFrame";
import { formatDate } from "./ui";
import { getPro } from "@/lib/catalog";
import type { GearStory } from "@/lib/editorial";
import s from "./journeys.module.css";

export default function StoryCard({ story }: { story: GearStory }) {
  const pro = getPro(story.proSlug);
  return (
    <article className={`card ${s.story}`}>
      <ProImage
        slug={story.proSlug}
        ratio="16 / 10"
        note="Player portrait; not a photo of the historical shoe trial."
      />
      <span className="eyebrow">
        {pro?.name} · Reported {formatDate(story.publishedOn)}
      </span>
      <h3>
        <Link href={`/stories/${story.slug}`}>{story.title}</Link>
      </h3>
      <p>{story.dek}</p>
      <Link href={`/stories/${story.slug}`} className="btn">
        Read the gear story
      </Link>
    </article>
  );
}
