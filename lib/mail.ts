import { after } from "next/server";

export type Mail = { to: string; subject: string; text: string };

type OutboxEntry = { subject: string; link: string | null };

const globalForMail = globalThis as unknown as { __triedKeptOutbox?: OutboxEntry[] };

function provider() {
  const url = process.env.MAIL_API_URL;
  const key = process.env.MAIL_API_KEY;
  const from = process.env.MAIL_FROM;
  return url && key && from && process.env.APP_URL ? { url, key, from } : null;
}

const isProduction = () => process.env.NODE_ENV === "production";

/** Production needs a real provider. Local development uses the on-screen outbox. */
export function mailReady(): boolean {
  return provider() !== null || !isProduction();
}

/** Links come from configuration, never from a request's Host header. */
export function appUrl(path: string): string {
  const base = process.env.APP_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}

async function deliver(mail: Mail, settings: NonNullable<ReturnType<typeof provider>>): Promise<void> {
  try {
    const response = await fetch(settings.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: settings.from, to: [mail.to], subject: mail.subject, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error(`Mail provider answered ${response.status}`);
  } catch {
    console.error("Could not reach the mail provider");
  }
}

/** Sends after the response, so how long a provider takes reveals nothing about an account. */
export function sendMail(mail: Mail): void {
  const settings = provider();
  if (settings) {
    after(() => deliver(mail, settings));
    return;
  }
  if (isProduction()) return;
  const outbox = (globalForMail.__triedKeptOutbox ??= []);
  const link = mail.text.match(/https?:\/\/\S+/)?.[0];
  // Kept as a path so the link works on whichever local port is running.
  outbox.unshift({ subject: mail.subject, link: link ? new URL(link).pathname + new URL(link).search : null });
  outbox.splice(5);
}

/** The latest messages, for local development only. Always empty in production. */
export function devOutbox(): OutboxEntry[] {
  if (isProduction() || provider()) return [];
  return globalForMail.__triedKeptOutbox ?? [];
}
