import { isIP } from "node:net";
import { headers } from "next/headers";

/** A /64 is what one IPv6 customer usually controls, so it counts as one address. */
function ipv6Prefix(ip: string): string {
  const [head = "", tail = ""] = ip.split("::");
  const start = head ? head.split(":") : [];
  const end = tail ? tail.split(":") : [];
  const gap = Array<string>(Math.max(0, 8 - start.length - end.length)).fill("0");
  const parts = [...start, ...gap, ...end].slice(0, 4);
  return `${parts.map((part) => part.toLowerCase().replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

export function normalizeIp(raw: string): string {
  const ip = raw.trim().replace(/^\[|\]$/g, "").split("%")[0];
  const mapped = ip.toLowerCase().startsWith("::ffff:") ? ip.slice(7) : ip;
  const version = isIP(mapped);
  if (version === 4) return mapped;
  if (version === 6) return ipv6Prefix(mapped);
  return "unknown";
}

/**
 * Reads the address added by the nearest trusted proxy. Entries further left can
 * be typed by the client, so they are ignored.
 */
export function clientIpFrom(forwardedFor: string | null, trustedHops: number): string {
  const entries = (forwardedFor ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  if (entries.length === 0) return "unknown";
  const hops = Number.isInteger(trustedHops) && trustedHops > 0 ? trustedHops : 1;
  return normalizeIp(entries[Math.max(0, entries.length - hops)]);
}

/**
 * Which header carries the visitor's address. Railway's edge documents X-Real-IP,
 * so that is the default there. Set CLIENT_IP_HEADER to override.
 */
export function clientIpHeader(env: Record<string, string | undefined> = process.env): "x-real-ip" | "x-forwarded-for" {
  const configured = env.CLIENT_IP_HEADER?.trim().toLowerCase();
  if (configured === "x-real-ip" || configured === "x-forwarded-for") return configured;
  return env.RAILWAY_ENVIRONMENT_NAME ? "x-real-ip" : "x-forwarded-for";
}

export async function clientIp(): Promise<string> {
  const list = await headers();
  if (clientIpHeader() === "x-real-ip") return normalizeIp(list.get("x-real-ip") ?? "");
  return clientIpFrom(list.get("x-forwarded-for"), Number(process.env.TRUSTED_PROXY_HOPS ?? "1"));
}
