import { test, expect } from "@playwright/test";

test("customer average, N, native panel scales and performance scores remain distinct", async ({
  page,
}) => {
  await page.goto("/gear/k-swiss-hypercourt-express-3");
  const ratings = page.locator("[data-shoe-ratings]");
  await expect(
    ratings.getByText("Pooled customer average", { exact: true }),
  ).toBeVisible();
  await expect(
    ratings.getByText("N = 87 listed reviews · 2 sources", { exact: true }),
  ).toBeVisible();
  await ratings.getByText("How to read these ratings", { exact: true }).tap();
  await expect(
    ratings.getByText(/cross-store overlap is unknown/),
  ).toBeVisible();
  await page.goto("/gear/nike-vapor-12");
  const panel = page.locator("[data-shoe-ratings] details[open]").first();
  await expect(panel.getByText("Comfort", { exact: true })).toBeVisible();
  await expect(
    panel.getByText("Support / stability", { exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("link", { name: /Read Tennis Warehouse source/ }),
  ).toHaveAttribute("href", /^https:\/\//);
});

test("missing width-specific ratings do not become zero stars or a borrowed average", async ({
  page,
}) => {
  await page.goto("/gear/asics-gel-resolution-x-wide-womens");
  const ratings = page.locator("[data-shoe-ratings]");
  await expect(
    ratings.getByText(/No matched customer average yet/),
  ).toBeVisible();
  await expect(
    ratings.getByText(/Playtest panel · Related variant/),
  ).toBeVisible();
  await expect(
    ratings.getByText("Customer average", { exact: true }),
  ).toHaveCount(0);
  await ratings.locator("summary").first().tap();
  await expect(
    ratings.getByText("Women’s STANDARD-width Gel Resolution X playtest", {
      exact: true,
    }),
  ).toBeVisible();
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
