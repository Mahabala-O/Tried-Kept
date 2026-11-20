import { expect, test, type Page } from "@playwright/test";

async function expectFocusedNavigation(page: Page) {
  const tabs = page.getByRole("navigation", { name: "Quick", exact: true });
  await expect(tabs.getByRole("link")).toHaveCount(3);
  const destinations = await page
    .locator("a[href]")
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );
  const competing = destinations.filter((href) =>
    /^\/(login|signup|me|community|report|u|play|stories|compare|switch|discover)([/?#]|$)/.test(
      href,
    ),
  );
  expect(competing).toEqual([]);
}

test("the public app has two sections and a compact mobile menu", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectFocusedNavigation(page);
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.tap();
  const sections = page.getByRole("navigation", {
    name: "Site sections",
    exact: true,
  });
  await expect(sections.getByRole("link")).toHaveCount(3);
  await expect(sections).toContainText("Catalogue");
  await expect(sections).toContainText("Pros");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page
    .getByRole("link", { name: "Explore the catalogue", exact: true })
    .tap();
  await expect(page.locator("h1")).toHaveText("Catalogue");
});

test("catalogue search leads straight to useful product advice", async ({
  page,
}) => {
  await page.goto("/gear", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Find a model or brand").fill("Vapor Pro 3");
  await page.getByRole("button", { name: "Search gear", exact: true }).tap();
  await expect(page.locator("main .product-card")).toHaveCount(1);
  const filters = page.getByRole("navigation", {
    name: "Filter gear",
    exact: true,
  });
  await expect(
    filters.getByRole("link", { name: /Nike/ }).locator('[aria-hidden="true"]'),
  ).toHaveText("1");
  await expect(
    filters
      .getByRole("link", { name: /ASICS/ })
      .locator('[aria-hidden="true"]'),
  ).toHaveText("0");
  await page
    .getByRole("heading", { name: /Vapor Pro 3/ })
    .getByRole("link")
    .tap();
  await expect(page.locator("h1")).toContainText("Vapor Pro 3");
  await expect(
    page.getByRole("heading", { name: "Strong suits", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Watch for", exact: true }),
  ).toBeVisible();
  const retailer = page.getByRole("link", { name: /Check price at Nike/ });
  await expect(retailer).toHaveAttribute("href", /^\/go\//);
  await expect(retailer).toHaveAttribute("rel", /sponsored nofollow/);
  await expectFocusedNavigation(page);
  await expect(
    page.getByRole("link", { name: "Compare this model", exact: true }),
  ).toBeVisible();
});

test("a product opens a comparison with the starting model retained", async ({
  page,
}) => {
  await page.goto("/gear/babolat-pure-aero-98-gen9", {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByRole("link", { name: "Compare this model", exact: true })
    .tap();
  await expect(page.getByLabel("First model", { exact: true })).toHaveValue(
    "babolat-pure-aero-98-gen9",
  );
  await expect(
    page
      .getByLabel("Second model", { exact: true })
      .locator('option[value="nike-vapor-12"]'),
  ).toHaveCount(0);
  await page
    .getByLabel("Second model", { exact: true })
    .selectOption("yonex-vcore-98-2026");
  await page.getByRole("button", { name: "Compare models", exact: true }).tap();
  await expect(page.locator("#comparison article")).toHaveCount(2);
  await expect(page.locator("#comparison")).toContainText(
    "Mass and measurement basis",
  );
  await expectFocusedNavigation(page);
  await expect(page.locator('.bottom-nav a[aria-current="page"]')).toHaveText(
    "Catalogue",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Second model", { exact: true })).toHaveValue(
    "yonex-vcore-98-2026",
  );
});

test("stories belong to the player and the gear bag comes first", async ({
  page,
}) => {
  await page.goto("/pros/iga-swiatek", { waitUntil: "domcontentloaded" });
  const equipment = await page.locator('h2[id="bag"]').boundingBox();
  const stories = await page.locator('h2[id="gear-stories"]').boundingBox();
  expect(equipment!.y).toBeLessThan(stories!.y);
  const storyLink = page
    .locator('a[href^="/pros/iga-swiatek/stories/"]')
    .first();
  const destination = await storyLink.getAttribute("href");
  await storyLink.tap();
  await page.waitForURL(`**${destination}`);
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb", exact: true }),
  ).toContainText("Iga Swiatek");
  await expect(page.locator('.bottom-nav a[aria-current="page"]')).toHaveText(
    "Pros",
  );
  await expectFocusedNavigation(page);
  const bad = await page.goto(
    destination!.replace("iga-swiatek", "carlos-alcaraz"),
    { waitUntil: "domcontentloaded" },
  );
  expect(bad?.status()).toBe(404);
});

test("old links resolve into the new hierarchy", async ({ page }) => {
  await page.goto("/compare/pick?left=nike-vapor-12&right=nike-vapor-pro-3", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(
    /\/gear\/compare\?left=nike-vapor-12&right=nike-vapor-pro-3$/,
  );
  await expect(page.locator("#comparison article")).toHaveCount(2);
  await page.goto("/compare/vapor-12-vs-vapor-pro-3", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/gear\/compare\/vapor-12-vs-vapor-pro-3$/);
  await page.goto("/stories", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/pros#stories$/);
  await page.goto("/switch?current=asics-gel-resolution-9", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/gear\/asics-gel-resolution-9$/);
  await page.goto("/discover?pro=naomi-osaka", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("h1")).toHaveText("Naomi Osaka");
});

test("changing comparison category clears incompatible choices", async ({
  page,
}) => {
  await page.goto("/gear/compare?left=nike-vapor-12&right=nike-vapor-pro-3", {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByLabel("First model", { exact: true })
    .selectOption("tecnifibre-tfight-305s");
  await expect(page.getByLabel("Second model", { exact: true })).toHaveValue(
    "",
  );
  await expect(
    page
      .getByLabel("Second model", { exact: true })
      .locator('option[value="nike-vapor-pro-3"]'),
  ).toHaveCount(0);
  await page
    .getByLabel("Second model", { exact: true })
    .selectOption("wilson-blade-98-16x19-v10");
  await page.getByRole("button", { name: "Compare models", exact: true }).tap();
  await expect(page.locator("#comparison article")).toHaveCount(2);
  await expect(page.locator("#comparison")).toContainText(
    "strung (retailer test)",
  );
  await page.goto("/gear/compare?left=nike-vapor-12&right=yonex-percept-97", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("status")).toContainText("same category");
  await expect(page.locator("#comparison")).toHaveCount(0);
});

test("search discovery includes the editorial library and keeps legacy areas unindexed", async ({
  request,
}) => {
  const map = await request.get("/sitemap.xml");
  expect(map.status()).toBe(200);
  const xml = await map.text();
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  expect(paths).toContain("/gear");
  expect(paths).toContain("/pros");
  expect(paths).toContain("/gear/compare/vapor-12-vs-vapor-pro-3");
  expect(
    paths.some((path) => /^\/pros\/[^/]+\/stories\/[^/]+$/.test(path)),
  ).toBe(true);
  expect(
    paths.filter((path) =>
      /^\/(community|u|me|report|play|login|signup|stories|compare|discover|switch)(\/|$)/.test(
        path,
      ),
    ),
  ).toEqual([]);
  for (const route of ["/community", "/signup"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(
      /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/,
    );
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("/sitemap.xml");
});
