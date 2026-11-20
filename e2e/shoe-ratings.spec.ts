import { test, expect } from "@playwright/test";

test("customer stars, review counts and on-court scores read in everyday language", async ({
  page,
}) => {
  await page.goto("/gear?category=shoe&q=Hypercourt+Express+3");
  const card = page.locator(
    '[data-product-card="k-swiss-hypercourt-express-3"]',
  );
  await expect(
    card.getByText("Based on 87 reviews across 2 sites", { exact: true }),
  ).toBeVisible();
  await card.getByRole("heading").getByRole("link").tap();
  const ratings = page.locator("[data-shoe-ratings]");
  await expect(
    ratings.getByText("Customer rating", { exact: true }),
  ).toBeVisible();
  await expect(
    ratings.getByText("Based on 87 reviews across 2 sites", { exact: true }),
  ).toBeVisible();
  await expect(
    ratings.getByText("Ratings vary by site", { exact: true }),
  ).toBeVisible();
  await ratings.getByText("Where the scores come from", { exact: true }).tap();
  await expect(
    ratings.getByText(/same person’s review may appear on more than one site/),
  ).toBeVisible();
  await page.goto("/gear/nike-vapor-12");
  const panel = page.locator("[data-shoe-ratings] details[open]").first();
  await expect(panel.locator("dt").filter({ hasText: /^Comfort/ })).toBeVisible();
  await expect(
    panel.getByText("Side-to-side support", { exact: false }).first(),
  ).toBeVisible();
  await expect(
    panel.getByRole("link", {
      name: /Read the full review at Tennis Warehouse/,
    }),
  ).toHaveAttribute("href", /^https:\/\//);
});

test("a handful of reviews is presented as early feedback", async ({
  page,
}) => {
  await page.goto("/gear/asics-solution-speed-ff-4-clay-womens");
  const ratings = page.locator("[data-shoe-ratings]");
  await expect(
    ratings.getByText("Based on 2 reviews from 1 site", { exact: true }),
  ).toBeVisible();
  await expect(
    ratings.getByText("Only a few reviews so far", { exact: true }),
  ).toBeVisible();
  await expect(
    ratings.getByText(/Read the fit comments and try the shoe on/),
  ).toBeVisible();
});

test("missing width-specific ratings do not become zero stars or a borrowed average", async ({
  page,
}) => {
  await page.goto("/gear/asics-gel-resolution-x-wide-womens");
  const ratings = page.locator("[data-shoe-ratings]");
  await expect(
    ratings.getByText(
      /We don’t have a customer rating for this exact version yet/,
    ),
  ).toBeVisible();
  await expect(
    ratings.getByText("Different or unconfirmed version.", { exact: true }),
  ).toBeVisible();
  await expect(
    ratings.getByText("Customer rating", { exact: true }),
  ).toHaveCount(0);
  await ratings.locator("summary").first().tap();
  await expect(ratings.locator("summary").first()).toBeVisible();
});

test("expanded rating evidence fits a narrow phone in light and dark themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/gear/new-balance-coco-cg2");
    const ratings = page.locator("[data-shoe-ratings]");
    const details = ratings.locator("details");
    for (let index = 0; index < (await details.count()); index++) {
      const detail = details.nth(index);
      if ((await detail.getAttribute("open")) === null)
        await detail.locator("summary").tap();
    }
    await expect(ratings).toBeVisible();
    expect(await ratings.innerText()).not.toMatch(
      /\bN\s*=|N not published|pooled|respondent|scale conversion|JSON-LD/,
    );
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    const overflow = await ratings.evaluate((element) =>
      [...element.querySelectorAll("*")]
        .filter(
          (child) =>
            child.getBoundingClientRect().width > 0 &&
            (child.getBoundingClientRect().right >
              document.documentElement.clientWidth + 1 ||
              child.getBoundingClientRect().left < -1),
        )
        .map((child) => child.tagName),
    );
    expect(overflow).toEqual([]);
  }
});
