import { expect, test } from "@playwright/test";

test("public pages have their own canonical, descriptive preview and safe structured data", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/gear/nike-vapor-12",
    "/pros/novak-djokovic",
    "/gear/compare/tfight-305s-vs-blade-98-v10",
    "/pros/iga-swiatek/stories/iga-swiatek-a-switch-worth-waiting-for",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    const href = await canonical.getAttribute("href");
    expect(new URL(href!).pathname).toBe(path);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      href!,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      await page.title(),
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/social\/tried-and-kept-card-v1\.png$/,
    );
    const graphs = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.flatMap(
          (script) => JSON.parse(script.textContent || "{}")["@graph"] ?? [],
        ),
      );
    expect(graphs.some((item) => item["@type"] === "WebSite")).toBe(true);
    if (path !== "/")
      expect(graphs.some((item) => item["@type"] === "BreadcrumbList")).toBe(
        true,
      );
    expect(
      graphs.some((item) =>
        ["AggregateRating", "Offer", "Review"].includes(item["@type"]),
      ),
    ).toBe(false);
  }
});

test("pagination remains discoverable while search and manual combinations stay out of the index", async ({
  page,
}) => {
  for (const path of [
    "/gear?page=2",
    "/gear?category=shoe&page=2",
    "/pros?page=2",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).pathname + new URL(canonical!).search).toBe(
      path,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow",
    );
  }
  for (const path of [
    "/gear?q=Vapor",
    "/pros?q=Novak",
    "/gear/compare?left=nike-vapor-12&right=nike-vapor-pro-3",
    "/login",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  }
});

test("sitemap, robots and the brand icon are served from the running site's configured origin", async ({
  request,
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const parsed = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    return {
      error: document.querySelector("parsererror")?.textContent,
      urls: [...document.querySelectorAll("loc")].map(
        (node) => node.textContent!,
      ),
    };
  }, xml);
  expect(parsed.error).toBeUndefined();
  const origin = new URL(parsed.urls[0]).origin;
  expect(xml).toContain(`${origin}/gear?category=shoe&amp;page=2`);
  expect(xml).not.toContain("/login");
  expect(xml).not.toContain("<lastmod>");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const icon = await request.get("/icon");
  expect(icon.status()).toBe(200);
  expect(icon.headers()["content-type"]).toContain("image/png");
});
