import { getComparison, getPro, getProduct, productLabel } from "./catalog";
import { gearStories } from "./editorial";
import { proMedia } from "./media";
import { comparisonHref, storyHref } from "./navigation";
import {
  absoluteUrl,
  catalogueState,
  prosState,
  SITE_NAME,
  type SearchQuery,
} from "./seo";

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function siteGraph() {
  const root = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${root}#organization`,
        name: SITE_NAME,
        url: root,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon"),
          width: 192,
          height: 192,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${root}#website`,
        name: SITE_NAME,
        alternateName: "Tried and Kept",
        url: root,
        publisher: { "@id": `${root}#organization` },
        inLanguage: "en",
      },
    ],
  };
}

type Crumb = { name: string; path: string };
export function breadcrumbGraph(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export type PageSchemaInput =
  | { kind: "product"; slug: string }
  | { kind: "pro"; slug: string }
  | { kind: "comparison"; slug: string }
  | { kind: "story"; slug: string; proSlug: string }
  | { kind: "catalogue" | "pros"; query: SearchQuery };

/** Describe our own pages. Imported retailer stars never become Review or
 * AggregateRating markup; stale prices never become merchant Offer markup. */
export function pageGraph(input: PageSchemaInput) {
  let path: string, name: string, crumbs: Crumb[];
  const extra: Record<string, unknown>[] = [];
  const page: Record<string, unknown> = {
    "@type": "WebPage",
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    inLanguage: "en",
  };
  if (input.kind === "product") {
    const product = getProduct(input.slug);
    if (!product) return null;
    path = `/gear/${product.slug}`;
    name = productLabel(product);
    page.description = product.summary;
    crumbs = [
      { name: "Catalogue", path: "/gear" },
      { name, path },
    ];
  } else if (input.kind === "pro") {
    const pro = getPro(input.slug);
    if (!pro) return null;
    path = `/pros/${pro.slug}`;
    name = `${pro.name} tennis gear`;
    const person = {
      "@type": "Person",
      "@id": `${absoluteUrl(path)}#person`,
      name: pro.name,
      url: absoluteUrl(path),
      ...(proMedia[pro.slug]?.portrait
        ? { image: absoluteUrl(proMedia[pro.slug].portrait!.src) }
        : {}),
    };
    extra.push(person);
    page.about = { "@id": person["@id"] };
    crumbs = [
      { name: "Pros", path: "/pros" },
      { name: pro.name, path },
    ];
  } else if (input.kind === "comparison") {
    const comparison = getComparison(input.slug);
    if (!comparison) return null;
    path = comparisonHref(comparison.slug);
    name = comparison.title;
    page.description = comparison.question;
    crumbs = [
      { name: "Catalogue", path: "/gear" },
      { name: "Comparisons", path: "/gear/compare" },
      { name, path },
    ];
  } else if (input.kind === "story") {
    const story = gearStories.find(
      (story) => story.slug === input.slug && story.proSlug === input.proSlug,
    );
    if (!story) return null;
    const pro = getPro(story.proSlug)!;
    path = storyHref(story);
    name = story.title;
    page.description = story.dek;
    const article: Record<string, unknown> = {
      "@type": "Article",
      "@id": `${absoluteUrl(path)}#article`,
      headline: story.title,
      description: story.dek,
      mainEntityOfPage: { "@id": `${absoluteUrl(path)}#page` },
      author: {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: SITE_NAME,
        url: absoluteUrl("/"),
      },
      publisher: { "@id": `${absoluteUrl("/")}#organization` },
    };
    if (proMedia[pro.slug]?.portrait)
      article.image = absoluteUrl(proMedia[pro.slug].portrait!.src);
    page.mainEntity = { "@id": article["@id"] };
    extra.push(article);
    // story.publishedOn is the historical source-report date, not our publication date.
    crumbs = [
      { name: "Pros", path: "/pros" },
      { name: pro.name, path: `/pros/${pro.slug}` },
      { name, path },
    ];
  } else {
    const state =
      input.kind === "catalogue"
        ? catalogueState(input.query)
        : prosState(input.query);
    if (!state.index) return null;
    path = state.path;
    name =
      input.kind === "catalogue"
        ? "Tennis gear catalogue"
        : "Tennis pro equipment";
    const items =
      input.kind === "catalogue"
        ? catalogueState(input.query).items.map((p) => ({
            name: productLabel(p),
            url: absoluteUrl(`/gear/${p.slug}`),
          }))
        : prosState(input.query).items.map((p) => ({
            name: p.name,
            url: absoluteUrl(`/pros/${p.slug}`),
          }));
    page["@type"] = "CollectionPage";
    page.mainEntity = {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        ...item,
      })),
    };
    crumbs = [{ name, path }];
  }
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...page,
        "@id": `${url}#page`,
        url,
        name,
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        ...breadcrumbGraph([{ name: "Home", path: "/" }, ...crumbs]),
        "@id": `${url}#breadcrumb`,
      },
      ...extra,
    ],
  };
}
