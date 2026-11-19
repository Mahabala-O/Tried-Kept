import { retailers, type Offer } from "./catalog";

export const ENTRY_POINTS = ["pro", "product", "own-gear", "compare", "finder", "direct"] as const;
export type EntryPoint = (typeof ENTRY_POINTS)[number];

export function parseEntryPoint(value: string | null): EntryPoint {
  return (ENTRY_POINTS as readonly string[]).includes(value ?? "") ? (value as EntryPoint) : "direct";
}

/**
 * Wraps a retailer URL in the approved affiliate template, when one is set.
 * Example: AFFILIATE_TEMPLATE_NIKE="https://network.example/click?id=123&u={url}"
 * With no valid template the shopper still gets the plain retailer page.
 */
export function buildOutboundUrl(offer: Offer, env: Record<string, string | undefined> = process.env): string {
  const template = env[retailers[offer.retailerId].templateEnv];
  if (!template || !template.includes("{url}")) return offer.url;
  const wrapped = template.replace("{url}", encodeURIComponent(offer.url));
  try {
    return new URL(wrapped).protocol === "https:" ? wrapped : offer.url;
  } catch {
    return offer.url;
  }
}

export function offerHref(offerId: string, from: EntryPoint): string {
  return `/go/${encodeURIComponent(offerId)}?from=${from}`;
}
