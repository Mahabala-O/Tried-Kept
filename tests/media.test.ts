import { describe, expect, it } from "vitest";
import { getPro, getProduct } from "@/lib/catalog";
import { allCredits, gifEmbedUrl, homeMedia, productPhotos, proMedia, type Gif, type Photo } from "@/lib/media";

const isHttps = (url: string) => new URL(url).protocol === "https:";

const allPhotos: Photo[] = [
  ...Object.values(proMedia).flatMap((m) => (m.portrait ? [m.portrait] : [])),
  ...Object.values(productPhotos),
  ...homeMedia.photos,
];
const allGifs: Gif[] = [...Object.values(proMedia).flatMap((m) => m.gifs), ...homeMedia.gifs];

const OPEN_LICENSES = /^(CC0( 1\.0)?|Public domain|CC BY(-SA)? \d\.\d|Unsplash License|Pexels License)$/;

describe("media keys", () => {
  it("only uses product slugs that exist in the catalog", () => {
    for (const slug of Object.keys(productPhotos)) expect(getProduct(slug), slug).toBeDefined();
  });

  it("only uses pro slugs that exist in the catalog", () => {
    for (const slug of Object.keys(proMedia)) expect(getPro(slug), slug).toBeDefined();
  });
});

describe("photos", () => {
  it("are all https", () => {
    for (const p of allPhotos) {
      expect(isHttps(p.src), p.src).toBe(true);
      expect(isHttps(p.credit.licenseUrl), p.credit.licenseUrl).toBe(true);
      expect(isHttps(p.credit.sourceUrl), p.credit.sourceUrl).toBe(true);
    }
  });

  it("carry a full credit under an open license", () => {
    for (const p of allPhotos) {
      expect(p.credit.author.trim(), p.src).not.toBe("");
      expect(p.credit.license.trim(), p.src).not.toBe("");
      expect(p.credit.licenseUrl.trim(), p.src).not.toBe("");
      expect(p.credit.sourceUrl.trim(), p.src).not.toBe("");
      expect(p.credit.license, p.src).toMatch(OPEN_LICENSES);
    }
  });

  it("have alt text and real dimensions", () => {
    for (const p of allPhotos) {
      expect(p.alt.trim(), p.src).not.toBe("");
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    }
  });

  it("are all listed in allCredits", () => {
    expect(allCredits()).toHaveLength(allPhotos.length);
  });

  it("are labeled with a display name, not a raw slug, when names are given", () => {
    const credits = allCredits({ pro: (slug) => getPro(slug)?.name, product: (slug) => getProduct(slug)?.name });
    for (const entry of credits) expect(entry.label, entry.photo.src).not.toMatch(/^[a-z0-9]+(-[a-z0-9]+)+$/);
  });
});

describe("gifs", () => {
  it("are all https and served by GIPHY", () => {
    for (const g of allGifs) {
      for (const url of [g.pageUrl, gifEmbedUrl(g)]) {
        expect(isHttps(url), url).toBe(true);
        expect(new URL(url).hostname, url).toMatch(/(^|\.)giphy\.com$/);
      }
    }
  });

  it("credit the channel, link the GIPHY page and have alt text", () => {
    for (const g of allGifs) {
      expect(g.channel.trim(), g.id).not.toBe("");
      expect(g.pageUrl.endsWith(g.id), g.id).toBe(true);
      expect(gifEmbedUrl(g), g.id).toBe(`https://giphy.com/embed/${g.id}`);
      expect(g.alt.trim(), g.id).not.toBe("");
      expect(g.width).toBeGreaterThan(0);
      expect(g.height).toBeGreaterThan(0);
    }
  });

  it("have unique ids", () => {
    const ids = allGifs.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("on a pro page only show that pro", () => {
    for (const [slug, media] of Object.entries(proMedia)) {
      const name = getPro(slug)?.name;
      for (const g of media.gifs) expect(g.playerName, g.id).toBe(name);
    }
  });
});
