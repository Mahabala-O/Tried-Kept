import { afterEach, describe, expect, it, vi } from "vitest";
import { comparisons, products, pros } from "@/lib/catalog";
import { gearStories } from "@/lib/editorial";
import {
  absoluteUrl,
  catalogueMetadata,
  catalogueState,
  comparisonMetadata,
  comparisonPickerMetadata,
  homeMetadata,
  libraryIndexPaths,
  productMetadata,
  proMetadata,
  prosMetadata,
  prosState,
  SOCIAL_IMAGE,
  storyMetadata,
} from "@/lib/seo";
import {
  pageGraph,
  serializeStructuredData,
  siteGraph,
} from "@/lib/structured-data";
import sitemap, { sitemapXml } from "@/lib/sitemap";
import robots from "@/app/robots";

afterEach(() => vi.unstubAllEnvs());

describe("search metadata", () => {
  it("gives each detail page its own canonical and matching social title", () => {
    vi.stubEnv("APP_URL", "https://tried-kept.example");
    for (const product of products) {
      const metadata = productMetadata(product);
      expect(metadata.alternates?.canonical).toBe(
        `https://tried-kept.example/gear/${product.slug}`,
      );
      expect(metadata.openGraph).toMatchObject({
        url: metadata.alternates?.canonical,
        title: `${metadata.title} · Tried & Kept`,
      });
      expect(metadata.twitter).toMatchObject({
        title: `${metadata.title} · Tried & Kept`,
        images: [`https://tried-kept.example${SOCIAL_IMAGE}`],
      });
    }
    for (const pro of pros)
      expect(proMetadata(pro).alternates?.canonical).toBe(
        `https://tried-kept.example/pros/${pro.slug}`,
      );
    for (const comparison of comparisons)
      expect(comparisonMetadata(comparison).alternates?.canonical).toBe(
        `https://tried-kept.example/gear/compare/${comparison.slug}`,
      );
    expect(homeMetadata().alternates?.canonical).toBe(
      "https://tried-kept.example/",
    );
  });
  it("keeps every real pagination page canonical to itself", () => {
    vi.stubEnv("APP_URL", "https://tried-kept.example");
    expect(catalogueMetadata({ page: "2" }).alternates?.canonical).toBe(
      "https://tried-kept.example/gear?page=2",
    );
    expect(catalogueMetadata({ page: "2" }).title).toContain("Page 2");
    expect(prosMetadata({ page: "2" }).alternates?.canonical).toBe(
      "https://tried-kept.example/pros?page=2",
    );
    const last = catalogueState({ page: "999" });
    expect(last.page).toBe(last.pages);
    expect(last.path).toBe(`/gear?page=${last.pages}`);
    expect(catalogueState({ page: "NaN" }).path).toBe("/gear");
    expect(catalogueState({ page: "1", utm_source: "campaign" }).path).toBe(
      "/gear",
    );
  });
  it("indexes curated categories while keeping search and brand-filter variations out", () => {
    expect(catalogueMetadata({ category: "shoe" })).toMatchObject({
      title: "Tennis Shoes: Ratings, Fit & Comparisons",
      robots: { index: true },
    });
    expect(catalogueMetadata({ q: "Vapor" }).robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: { index: false },
    });
    expect(catalogueMetadata({ brand: "Nike" }).robots).toMatchObject({
      index: false,
    });
    expect(prosMetadata({ q: "Novak" }).robots).toMatchObject({ index: false });
    expect(prosMetadata({ tour: "ATP" }).robots).toMatchObject({ index: true });
  });
  it("matches the visible catalogue and pro filter behaviour for repeated or invalid query parameters", () => {
    expect(
      catalogueState({
        q: ["Vapor", "Court"],
        category: "not-real",
        page: ["2", "3"],
      }),
    ).toMatchObject({ q: "", category: "", page: 1, path: "/gear" });
    expect(
      prosState({ q: ["Novak", "Carlos"], tour: ["ATP", "WTA"] }),
    ).toMatchObject({ q: "", tour: "", path: "/pros" });
    expect(
      catalogueState({ category: "shoe", page: "2" }).items.every(
        (p) => p.category === "shoe",
      ),
    ).toBe(true);
  });
  it("does not index manual pair permutations or invalid selections", () => {
    const left = "nike-vapor-12",
      right = "nike-vapor-pro-3";
    const first = comparisonPickerMetadata({ left, right });
    const reversed = comparisonPickerMetadata({ left: right, right: left });
    expect(first.robots).toMatchObject({ index: false });
    expect(first.alternates?.canonical).toBe(reversed.alternates?.canonical);
    expect(
      comparisonPickerMetadata({ left: "not-a-model" }).robots,
    ).toMatchObject({ index: false });
    expect(comparisonPickerMetadata().robots).toMatchObject({ index: true });
  });
  it("uses the nested story URL and article sharing type", () => {
    const story = gearStories[0];
    expect(storyMetadata(story).alternates?.canonical).toContain(
      `/pros/${story.proSlug}/stories/${story.slug}`,
    );
    expect(storyMetadata(story).openGraph).toMatchObject({ type: "article" });
  });
});

describe("sitemap and page descriptions", () => {
  it("covers category and pagination pages without adding search results or manual pairs", () => {
    vi.stubEnv("APP_URL", "https://tried-kept.example");
    const urls = sitemap().map((item) => item.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const path of libraryIndexPaths())
      expect(urls).toContain(`https://tried-kept.example${path}`);
    expect(urls).toContain(
      "https://tried-kept.example/gear?category=shoe&page=2",
    );
    expect(urls.every((url) => !/[?&](q|brand|left|right)=/.test(url))).toBe(
      true,
    );
    expect(
      urls.every(
        (url) => !/\/(login|signup|community|me|play)(\/|$)/.test(url),
      ),
    ).toBe(true);
    expect(sitemap().every((entry) => entry.lastModified === undefined)).toBe(
      true,
    );
    expect(robots().sitemap).toBe("https://tried-kept.example/sitemap.xml");
  });
  it("describes the real site and a breadcrumb trail ending at the current page", () => {
    const graph = pageGraph({ kind: "product", slug: "nike-vapor-12" })!;
    const page = graph["@graph"][0];
    expect(page).toMatchObject({
      "@type": "WebPage",
      name: "Nike Vapor 12 (Men's)",
    });
    const crumbs = graph["@graph"][1] as {
      itemListElement: { position: number; item: string }[];
    };
    expect(crumbs.itemListElement.at(-1)?.item).toBe(page.url);
    expect(crumbs.itemListElement.map((item) => item.position)).toEqual([
      1, 2, 3,
    ]);
    expect(siteGraph()["@graph"].map((item) => item["@type"])).toEqual([
      "Organization",
      "WebSite",
    ]);
  });
  it("describes only visible items on the current page of a collection", () => {
    const state = catalogueState({ category: "shoe", page: "2" });
    const graph = pageGraph({
      kind: "catalogue",
      query: { category: "shoe", page: "2" },
    })!;
    const page = graph["@graph"][0] as {
      mainEntity: {
        numberOfItems: number;
        itemListElement: { position: number; url: string }[];
      };
    };
    expect(page.mainEntity.numberOfItems).toBe(state.items.length);
    expect(page.mainEntity.itemListElement[0].position).toBe(1);
    expect(page.mainEntity.itemListElement.map((item) => item.url)).toEqual(
      state.items.map((item) => absoluteUrl(`/gear/${item.slug}`)),
    );
    expect(pageGraph({ kind: "catalogue", query: { q: "Vapor" } })).toBeNull();
  });
  it("does not pass imported ratings or stale shop prices off as Google review or merchant data", () => {
    for (const product of products) {
      const graph = JSON.stringify(
        pageGraph({ kind: "product", slug: product.slug }),
      );
      expect(graph).not.toMatch(
        /"(aggregateRating|reviewRating|offers|price|availability)"/,
      );
      expect(graph).not.toMatch(/"@type":"(Review|AggregateRating|Offer)"/);
    }
  });
  it("does not label a historical source-report date as our own article publication date", () => {
    const story = gearStories[0];
    const article = pageGraph({
      kind: "story",
      slug: story.slug,
      proSlug: story.proSlug,
    })!["@graph"].find((node) => node["@type"] === "Article")!;
    expect(article).toMatchObject({
      "@type": "Article",
      headline: story.title,
    });
    expect(article.datePublished).toBeUndefined();
    expect(
      pageGraph({ kind: "story", slug: story.slug, proSlug: "wrong-pro" }),
    ).toBeNull();
  });
  it("safely serializes text that could otherwise close a script element", () => {
    const value = { name: "</script><script>alert('x')</script>" };
    const serialized = serializeStructuredData(value);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(value);
  });
  it("escapes query separators in sitemap XML without changing the underlying canonical URLs", () => {
    vi.stubEnv("APP_URL", "https://tried-kept.example");
    expect(sitemapXml()).toContain(
      "https://tried-kept.example/gear?category=shoe&amp;page=2",
    );
    expect(sitemapXml()).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    expect(
      sitemap().some((entry) => entry.url.endsWith("?category=shoe&page=2")),
    ).toBe(true);
  });
});
