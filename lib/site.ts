export function siteOrigin(): string {
  return new URL(
    process.env.APP_URL || "https://tried-kept-production.up.railway.app",
  ).origin;
}
