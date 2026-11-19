/**
 * Pure constants and validators shared by the account forms and server actions.
 * Safe to import from client components: nothing here touches the server.
 */

export type ActionState = { error?: string; ok?: string };

export const LIMITS = {
  usernameMin: 3,
  usernameMax: 20,
  displayNameMax: 40,
  emailMax: 254,
  passwordMin: 10,
  passwordMax: 200,
  bioMax: 280,
  weeklyHoursMax: 40,
  sizeMax: 20,
  widthMax: 20,
  hoursMax: 5000,
  priceMax: 2000,
  notesMax: 500,
} as const;

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

/** Names that would collide with routes or could pass as staff. */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  "about", "account", "accounts", "admin", "administrator", "api", "app", "community", "compare",
  "contact", "disclosure", "gear", "go", "help", "home", "login", "logout", "me", "mod", "moderator",
  "null", "official", "play", "privacy", "pros", "report", "reports", "root", "security", "settings",
  "signin", "signup", "staff", "support", "system", "team", "terms", "tried_and_kept", "triedandkept",
  "undefined", "user", "users", "www",
]);

export const SURFACES = [
  { value: "hard", label: "Hard" },
  { value: "clay", label: "Clay" },
  { value: "grass", label: "Grass" },
  { value: "mixed", label: "Mixed" },
] as const;

export const PLAY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "competitive", label: "Competitive" },
] as const;

export const LOCKER_STATUSES = [
  { value: "using", label: "Using" },
  { value: "retired", label: "Retired" },
  { value: "want", label: "Want to try" },
] as const;

export type LockerStatus = (typeof LOCKER_STATUSES)[number]["value"];

export function isLockerStatus(value: string): value is LockerStatus {
  return LOCKER_STATUSES.some((s) => s.value === value);
}

export function labelFor(options: readonly { value: string; label: string }[], value: string): string | null {
  return options.find((o) => o.value === value)?.label ?? null;
}

export function formText(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

/** Removes control characters and surrounding space. Newlines survive only when multiline. */
export function cleanText(value: string, multiline = false): string {
  const unified = value.replace(/\r\n?/g, "\n");
  const stripped = multiline
    ? unified.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "")
    : unified.replace(/[\u0000-\u001f\u007f]/g, " ");
  return stripped.trim();
}

/** Format characters and blank-looking letters would leave a name that cannot be seen. */
const INVISIBLE = /[\p{Cf}\u115f\u1160\u17b4\u17b5\u2800\u3164\uffa0]/gu;

export function cleanDisplayName(value: string): string {
  return cleanText(value).replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
}

const STAFF_WORDS: ReadonlySet<string> = new Set([
  "admin", "administrator", "mod", "moderator", "official", "staff", "support", "system",
]);

/** Expects a name already passed through cleanDisplayName. */
export function displayNameError(name: string): string | null {
  if (name.length < 1 || name.length > LIMITS.displayNameMax) {
    return `Enter a display name of up to ${LIMITS.displayNameMax} characters.`;
  }
  if (!/[\p{L}\p{N}\p{S}]/u.test(name)) return "Use at least one visible letter or number in your display name.";

  const normalized = name.normalize("NFKC").toLowerCase();
  const compact = normalized.replace(/[^\p{L}\p{N}]/gu, "");
  const words = normalized.split(/[^\p{L}\p{N}]+/u);
  if (compact.includes("triedandkept") || compact.includes("triedkept") || words.some((w) => STAFF_WORDS.has(w))) {
    return "That display name could be mistaken for site staff. Try another one.";
  }
  return null;
}

export type ParsedNumber = { ok: true; value: number | null } | { ok: false };

/** Blank means "not set". Anything else must be a plain number within the range. */
export function parseOptionalNumber(raw: string, min: number, max: number): ParsedNumber {
  const text = raw.trim();
  if (text === "") return { ok: true, value: null };
  if (!/^(\d{1,6}(\.\d{0,2})?|\.\d{1,2})$/.test(text)) return { ok: false };
  const value = Number(text);
  if (!Number.isFinite(value) || value < min || value > max) return { ok: false };
  return { ok: true, value };
}

/** Accepts only same-site relative paths, so a crafted link cannot send someone elsewhere. */
export function safeNext(value: unknown, fallback = "/me"): string {
  if (typeof value !== "string" || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const base = "http://tried-and-kept.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    // "/.//host" normalizes to "//host", which a browser reads as another site.
    if (url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
