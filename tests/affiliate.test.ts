import { afterEach, describe, expect, it, vi } from "vitest";
import { ENTRY_POINTS, buildOutboundUrl, offerHref, parseEntryPoint } from "@/lib/affiliate";
import { getOffer } from "@/lib/catalog";

const nike = getOffer("nike-vapor-12-nike")!.offer;
const asics = getOffer("asics-res-x-wide-mens-asics")!.offer;

describe("buildOutboundUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns the plain retailer URL with no template", () => {
    expect(buildOutboundUrl(nike, {})).toBe(nike.url);
    expect(buildOutboundUrl(nike, { AFFILIATE_TEMPLATE_NIKE: "" })).toBe(nike.url);
  });

  it("encodes the retailer URL into a valid template", () => {
    const result = buildOutboundUrl(nike, { AFFILIATE_TEMPLATE_NIKE: "https://network.example/click?id=123&u={url}" });
    expect(result).toBe(`https://network.example/click?id=123&u=${encodeURIComponent(nike.url)}`);
    expect(new URL(result).searchParams.get("u")).toBe(nike.url);
  });

  it("reads the template from the environment by default", () => {
    vi.stubEnv("AFFILIATE_TEMPLATE_NIKE", "https://network.example/c?u={url}");
    expect(buildOutboundUrl(nike)).toBe(`https://network.example/c?u=${encodeURIComponent(nike.url)}`);
  });

  it("uses only the template for the offer's retailer", () => {
    const env = { AFFILIATE_TEMPLATE_NIKE: "https://network.example/c?u={url}" };
    expect(buildOutboundUrl(asics, env)).toBe(asics.url);
  });

  it.each([
    ["has no {url} placeholder", "https://network.example/click?id=123"],
    ["uses http", "http://network.example/click?u={url}"],
    ["uses a script scheme", "javascript:alert(1)//{url}"],
    ["is not a URL", "not a url {url}"],
    ["is only the placeholder", "{url}"],
  ])("falls back to the retailer URL when the template %s", (_label, template) => {
    expect(buildOutboundUrl(nike, { AFFILIATE_TEMPLATE_NIKE: template })).toBe(nike.url);
  });
});

describe("parseEntryPoint", () => {
  it.each(ENTRY_POINTS)("accepts %s", (entry) => {
    expect(parseEntryPoint(entry)).toBe(entry);
  });

  it.each([null, "", "PRO", "homepage", "pro "])("treats %j as direct", (value) => {
    expect(parseEntryPoint(value)).toBe("direct");
  });
});

describe("offerHref", () => {
  it("routes through /go with the entry point", () => {
    expect(offerHref("nike-vapor-12-nike", "pro")).toBe("/go/nike-vapor-12-nike?from=pro");
  });

  it("encodes the offer id", () => {
    expect(offerHref("a/b?c", "direct")).toBe("/go/a%2Fb%3Fc?from=direct");
  });
});
