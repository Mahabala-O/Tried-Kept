import type { Metadata } from "next";
import {
  products,
  pros,
  productLabel,
  type Product,
  type Pro,
  type Comparison,
} from "./catalog";
import { comparablePair } from "./discovery";
import { comparisonHref, storyHref } from "./navigation";
import type { GearStory } from "./editorial";
import { paginate } from "./pagination";
import { siteOrigin } from "./site";

export const SITE_NAME = "Tried & Kept";
export const SOCIAL_IMAGE = "/social/tried-and-kept-card-v1.png";
export type SearchQuery = Record<string, string | string[] | undefined>;

export function absoluteUrl(path: string) {
  return new URL(path, `${siteOrigin()}/`).href;
}

/** Every indexable page declares its own canonical; never inherit the homepage URL. */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  article = false,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  article?: boolean;
}): Metadata {
  const fullTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: article ? "article" : "website",
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      url: absoluteUrl(path),
      images: [
        {
          url: absoluteUrl(SOCIAL_IMAGE),
          width: 1200,
          height: 630,
          alt: "Tried & Kept — Find your next keeper. Tennis court, racquet and ball graphic.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(SOCIAL_IMAGE)],
    },
  };
}

export function homeMetadata() {
  const metadata = pageMetadata({
    title: "Tennis Gear, Shoe Ratings & Pro Setups",
    description:
      "Find tennis shoes and racquets that suit your game. Explore fit advice, customer ratings, gear comparisons and the equipment linked to your favourite pros.",
    path: "/",
  });
  return {
    ...metadata,
    title: {
      absolute: "Tennis Gear, Shoe Ratings & Pro Setups · Tried & Kept",
    },
  };
}

export function productMetadata(product: Product) {
  const name = productLabel(product);
  const shoe = product.category === "shoe";
  return pageMetadata({
    title: `${name}: ${shoe ? "Ratings & Fit" : product.category === "racquet" ? "Specs & Comparisons" : "Fit & Details"}`,
    description: shoe
      ? `Explore ${name}: customer ratings, on-court reviews, fit notes, specifications and comparisons. Check the reviewed version before choosing your next tennis shoe.`
      : `Explore ${name}, with sourced specifications, strengths, things to check before buying and retailer links. Find out whether it suits your tennis game.`,
    path: `/gear/${product.slug}`,
  });
}

export function proMetadata(pro: Pro) {
  return pageMetadata({
    title: `${pro.name}: Shoes, Racquet & Tennis Gear`,
    description: `Explore ${pro.name}’s tennis shoes, racquet, court style and gear stories. See dated reports and brand listings, with sources and shop-model differences explained.`,
    path: `/pros/${pro.slug}`,
  });
}

export function comparisonMetadata(comparison: Comparison) {
  return pageMetadata({
    title: comparison.title,
    description: `${comparison.question} Compare the specifications, strengths and tradeoffs, with sources and practical advice for your own court test.`,
    path: comparisonHref(comparison.slug),
  });
}

export function storyMetadata(story: GearStory) {
  return pageMetadata({
    title: story.title,
    description: story.dek,
    path: storyHref(story),
    article: true,
  });
}

const single = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
const queryPath = (base: string, query: Record<string, string>) => {
  const params = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value),
  );
  return params.size ? `${base}?${params}` : base;
};
const pageSuffix = (page: number) => (page > 1 ? ` · Page ${page}` : "");

const categoryCopy: Record<string, { title: string; description: string }> = {
  shoe: {
    title: "Tennis Shoes: Ratings, Fit & Comparisons",
    description:
      "Compare tennis shoes by fit, cushioning, support and court type. Explore customer ratings, on-court reviews and the versions linked to the pros.",
  },
  racquet: {
    title: "Tennis Racquets: Specs & Comparisons",
    description:
      "Explore tennis racquets, compare weight, head size and string patterns, and learn what the differences mean for your game.",
  },
  sock: {
    title: "Tennis Socks: Fit & Comfort",
    description:
      "Explore tennis socks with material, cushioning and fit details, source links and things to check before buying.",
  },
  clothing: {
    title: "Tennis Clothing: Court Style & Fit",
    description:
      "Explore tennis shirts, shorts and court clothing, with product photographs, material details and fit advice.",
  },
};

export function catalogueState(query: SearchQuery = {}) {
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const category = Object.hasOwn(categoryCopy, single(query.category))
    ? single(query.category)
    : "";
  const brand = products.some((p) => p.brand === single(query.brand))
    ? single(query.brand)
    : "";
  const matches = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!brand || p.brand === brand) &&
      `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase()),
  );
  const result = paginate(
    matches,
    typeof query.page === "string" ? query.page : undefined,
  );
  const path = queryPath("/gear", {
    category,
    brand,
    q,
    page: result.page > 1 ? String(result.page) : "",
  });
  return { ...result, path, category, brand, q, index: !q && !brand };
}

export function catalogueMetadata(query: SearchQuery = {}) {
  const state = catalogueState(query);
  const copy = categoryCopy[state.category] ?? {
    title: "Tennis Gear: Shoes, Racquets & Comparisons",
    description:
      "Explore tennis shoes, racquets, socks and clothing. Compare fit, ratings and specifications, with dated sources and practical buying advice.",
  };
  return pageMetadata({
    title: `${state.q ? `Gear search: ${state.q}` : state.brand ? `${state.brand} Tennis Gear` : copy.title}${pageSuffix(state.page)}`,
    description: `${copy.description}${state.page > 1 ? ` Browse page ${state.page}.` : ""}`,
    path: state.path,
    index: state.index,
  });
}

export function prosState(query: SearchQuery = {}) {
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const tour = query.tour === "ATP" || query.tour === "WTA" ? query.tour : "";
  const result = paginate(
    pros.filter(
      (p) =>
        (!tour || p.tour === tour) &&
        p.name.toLowerCase().includes(q.toLowerCase()),
    ),
    typeof query.page === "string" ? query.page : undefined,
  );
  const path = queryPath("/pros", {
    tour,
    q,
    page: result.page > 1 ? String(result.page) : "",
  });
  return { ...result, path, q, tour, index: !q };
}

export function prosMetadata(query: SearchQuery = {}) {
  const state = prosState(query);
  return pageMetadata({
    title: `${state.q ? `Find a pro: ${state.q}` : `${state.tour ? `${state.tour} ` : ""}Tennis Pros: Shoes, Racquets & Gear`}${pageSuffix(state.page)}`,
    description: `Explore the tennis equipment linked to ${state.tour ? `${state.tour} ` : ""}pros: shoes, racquets, court style, gear stories and sponsorship facts, with dates and sources.${state.page > 1 ? ` Browse page ${state.page}.` : ""}`,
    path: state.path,
    index: state.index,
  });
}

/** Manual picker combinations are useful tools, not thousands of indexable landing pages. */
export function comparisonPickerMetadata(query: SearchQuery = {}) {
  const pair = comparablePair(
    typeof query.left === "string" ? query.left : "",
    typeof query.right === "string" ? query.right : "",
  );
  const ordered = pair
    ? [...pair].sort((a, b) => a.slug.localeCompare(b.slug))
    : null;
  return pageMetadata({
    title: pair
      ? `${productLabel(pair[0])} vs ${productLabel(pair[1])}`
      : "Compare Tennis Shoes & Racquets",
    description: pair
      ? `Compare ${productLabel(pair[0])} and ${productLabel(pair[1])}: specifications, strengths and tradeoffs for your own game.`
      : "Compare two tennis shoes or racquets, explore their differences and open our sourced comparison guides.",
    path: ordered
      ? queryPath("/gear/compare", {
          left: ordered[0].slug,
          right: ordered[1].slug,
        })
      : "/gear/compare",
    index: !single(query.left) && !single(query.right),
  });
}

export function libraryIndexPaths() {
  const paths: string[] = [];
  for (const category of ["", ...Object.keys(categoryCopy)]) {
    const first = catalogueState({ category });
    for (let page = 1; page <= first.pages; page++)
      paths.push(catalogueState({ category, page: String(page) }).path);
  }
  for (const tour of ["", "ATP", "WTA"]) {
    const first = prosState({ tour });
    for (let page = 1; page <= first.pages; page++)
      paths.push(prosState({ tour, page: String(page) }).path);
  }
  return [...new Set(paths)];
}
