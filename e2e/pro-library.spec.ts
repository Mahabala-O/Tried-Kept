import { expect, test } from "@playwright/test";

test("pro pages fill in order, keep every player, and expose next and previous navigation", async ({
  page,
}) => {
  await page.goto("/pros", { waitUntil: "domcontentloaded" });
  const expected = Number(
    (await page.locator("#players").innerText()).match(/of (\d+) players/)![1],
  );
  const seen: string[] = [];
  for (let index = 0; index < 10; index++) {
    const cards = page.locator("[data-pro-card]");
    const slugs = await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-pro-card")!),
    );
    const next = page.getByRole("link", { name: "Next page →", exact: true });
    if (await next.count()) expect(slugs).toHaveLength(12);
    else expect(slugs.length).toBeLessThanOrEqual(12);
    seen.push(...slugs);
    await expect(cards.locator(".sticker-blue")).toHaveCount(0);
    if (!(await next.count())) break;
    await next.tap();
    await expect(cards.first()).not.toHaveAttribute("data-pro-card", slugs[0]);
  }
  expect(seen).toHaveLength(expected);
  expect(new Set(seen).size).toBe(expected);
  await page.getByRole("link", { name: "← Previous page", exact: true }).tap();
  await expect(page.locator("[data-pro-card]")).toHaveCount(12);
  await page.getByLabel("Tour", { exact: true }).selectOption("WTA");
  await page.getByRole("button", { name: "Find players", exact: true }).tap();
  await expect.poll(() => new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(
    page.locator("[data-pro-card] > p").filter({ hasText: /^WTA$/ }),
  ).toHaveCount(10);
  await page.getByRole("link", { name: "Clear filters", exact: true }).tap();
  await expect(page.getByLabel("Tour", { exact: true })).toHaveValue("");
  await expect(page.locator("[data-pro-card]")).toHaveCount(12);
});

test("profile sections separate reported deal values from private terms", async ({
  page,
}) => {
  await page.goto("/pros/carlos-alcaraz", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("navigation", { name: "Profile sections", exact: true })
    .getByRole("link", { name: "Sponsorship deals", exact: true })
    .tap();
  await expect(page.locator("#partnerships")).toContainText("Reported value");
  await expect(page.locator("#partnerships")).toContainText(
    "US$15–20 million per year",
  );
  await expect(page.locator("#partnerships a")).toHaveAttribute(
    "href",
    /relevo\.com/,
  );
  await page.goto("/pros/iga-swiatek", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#partnerships")).toContainText(
    "Not disclosed in the announcement",
  );
  await expect(page.locator("#partnerships")).not.toContainText("US$");
  await expect(
    page
      .getByRole("navigation", { name: "Profile sections", exact: true })
      .getByRole("link", { name: "Stories", exact: true }),
  ).toHaveAttribute("href", "#gear-stories");
});

test("socks and clothing have real catalogue entries, suitable facts and retailer links", async ({
  page,
}) => {
  await page.goto("/gear?category=sock", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-product-card]")).toHaveCount(2);
  await page
    .getByRole("link", {
      name: "TX Maximum Cushion Crew Tennis Socks (Unisex)",
      exact: true,
    })
    .tap();
  await expect(page.locator("h1")).toContainText("TX Maximum Cushion");
  await expect(
    page.getByRole("link", { name: "Compare this model", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Explore more socks", exact: true }),
  ).toHaveAttribute("href", "/gear?category=sock");
  await expect(page.locator('a[href^="/go/"]').first()).toHaveAttribute(
    "rel",
    /sponsored/,
  );
  await expect(page.locator("main")).not.toContainText(
    "interior width at the ball of the foot",
  );
  await page.goto("/gear?category=clothing", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-product-card]")).toHaveCount(4);
  await expect(page.locator(".product-photo")).toHaveCount(4);
  await page
    .getByRole("link", {
      name: "NikeCourt Victory Dri-FIT Tennis Top (Men's)",
      exact: true,
    })
    .tap();
  await expect(page.locator("main")).toContainText("100% polyester");
  await expect(
    page.getByRole("link", { name: "Explore more clothing", exact: true }),
  ).toHaveAttribute("href", "/gear?category=clothing");
});
