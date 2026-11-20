import { expect, test } from "@playwright/test";

test("a pro bag leads to two goal-specific frames and a usable comparison", async ({
  page,
}) => {
  await page.goto("/pros/carlos-alcaraz", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("link", {
      name: "Inspired by Carlos Alcaraz? Find my version →",
    })
    .tap();
  await page.getByLabel("3. What matters most to you?").selectOption("spin");
  await page.getByRole("button", { name: "Find my options →" }).tap();
  await expect(page.locator(".bottom-nav").getByRole("link", { name: "Find gear", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#shortlist article")).toHaveCount(2);
  await expect(page.locator("#shortlist")).toContainText("Pure Aero 98 Gen9");
  await expect(page.locator("#shortlist")).toContainText("VCORE 98");
  await expect(page.locator("#shortlist")).toContainText("The compromise:");
  const savedURL = page.url();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#shortlist article")).toHaveCount(2);
  expect(page.url()).toBe(savedURL);
  await page.getByRole("link", { name: "Compare these two →" }).tap();
  await expect(page.locator("#comparison article")).toHaveCount(2);
  await expect(page.locator("#comparison")).toContainText(
    "Mass and measurement basis",
  );
  const link = page
    .getByRole("link", { name: "Tried this after the other? Record it →" })
    .first();
  const target = await link.getAttribute("href");
  await link.tap();
  await page.waitForURL("**/login?**");
  expect(new URL(page.url()).searchParams.get("next")).toBe(target);
});

test("the larger pro library stays searchable and paginated", async ({
  page,
}) => {
  await page.goto("/pros", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("navigation", { name: "Player pages" }),
  ).toBeVisible();
  await page.getByLabel("Find a player").fill("Osaka");
  await page.getByRole("button", { name: "Find players" }).tap();
  await expect(page.getByRole("status")).toContainText("1 player");
  await expect(
    page.getByRole("heading", { name: "Naomi Osaka", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "See the full bag", exact: true }).tap();
  await expect(page.locator("h1")).toHaveText("Naomi Osaka");
  await expect(page.locator("main")).toContainText("Brand listing checked");
});

test("women's clay results keep the evidence gap instead of inventing a pair", async ({
  page,
}) => {
  await page.goto(
    "/discover?pro=iga-swiatek&category=shoe&goal=handling&line=womens&surface=clay",
    { waitUntil: "domcontentloaded" },
  );
  await expect(page.locator("#shortlist article")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("One supported option");
  await expect(page.locator("#shortlist article")).toContainText(
    "Manufacturer only",
  );
  await expect(
    page.getByRole("link", { name: "Compare these two →" }),
  ).toHaveCount(0);
  await page.getByLabel("Your court surface").selectOption("hard");
  await page.getByLabel("3. What matters most to you?").selectOption("support");
  await page.getByRole("button", { name: "Find my options →" }).tap();
  await expect(page.locator("#shortlist article")).toHaveCount(2);
  await expect(page.locator("#shortlist article").first()).toContainText(
    "Women's",
  );
});

test("comparison builder handles bad pairs and changing categories", async ({
  page,
}) => {
  await page.goto("/compare/pick?left=nike-vapor-12&right=yonex-percept-97", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("status")).toContainText("same category");
  await expect(page.locator("#comparison")).toHaveCount(0);
  await page
    .getByLabel("First model", { exact: true })
    .selectOption("tecnifibre-tfight-305s");
  await page
    .getByLabel("Second model", { exact: true })
    .selectOption("wilson-blade-98-16x19-v10");
  await page.getByRole("button", { name: "Compare models" }).tap();
  await expect(page.locator("#comparison article")).toHaveCount(2);
  await expect(page.locator("#comparison")).toContainText(
    "strung (retailer test)",
  );
});
