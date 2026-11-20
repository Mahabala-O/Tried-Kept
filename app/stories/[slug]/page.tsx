import { notFound, permanentRedirect } from "next/navigation";
import { gearStories } from "@/lib/editorial";
import { storyHref } from "@/lib/navigation";
export default async function LegacyStory({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = gearStories.find((item) => item.slug === slug);
  if (!story) notFound();
  permanentRedirect(storyHref(story));
}
