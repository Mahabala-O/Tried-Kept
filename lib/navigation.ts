import type { GearStory } from "./editorial";

/** The public product has two sections. Comparisons and stories live inside them. */
export const PUBLIC_SECTIONS = [
  {
    href: "/gear",
    label: "Catalogue",
    matches: ["/gear", "/compare", "/switch", "/discover", "/play"],
  },
  { href: "/pros", label: "Pros", matches: ["/pros", "/stories"] },
] as const;

export function sectionIsCurrent(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function comparisonHref(slug: string): string {
  return `/gear/compare/${slug}`;
}

export function storyHref(story: Pick<GearStory, "proSlug" | "slug">): string {
  return `/pros/${story.proSlug}/stories/${story.slug}`;
}
