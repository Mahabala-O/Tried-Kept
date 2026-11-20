import { expect, test } from "@playwright/test";

test("the keeper court opens the right category and credits the pictured gear", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const court = page.locator("[data-home-court]");
  await expect(court.getByRole("img")).toHaveCount(2);
  await court.getByText("Product photos & pictured models").tap();
  await expect(
    court.getByRole("link", { name: /Nike Vapor 12/ }),
  ).toHaveAttribute("href", "/gear/nike-vapor-12");
  await expect(
    court.getByRole("link", { name: /Pure Aero 98/ }),
  ).toHaveAttribute("href", "/gear/babolat-pure-aero-98-gen9");
  await court.getByRole("link", { name: "Explore shoes", exact: true }).tap();
  await expect(page).toHaveURL(/\/gear\?category=shoe$/);
  await expect(page.getByRole("link", { name: /^Shoes ,/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await court
    .getByRole("link", { name: "Explore racquets", exact: true })
    .tap();
  await expect(page).toHaveURL(/\/gear\?category=racquet$/);
});

test("court destinations stay reachable at small widths and enlarged text", async ({
  page,
}) => {
  for (const [width, textSize] of [
    [320, "100%"],
    [390, "200%"],
    [1280, "100%"],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = size;
    }, textSize);
    const court = page.locator("[data-home-court]");
    const geometry = await court
      .locator('a[aria-label^="Explore"]')
      .evaluateAll((links) =>
        links.map((link) => {
          const box = link.getBoundingClientRect();
          const frame = link
            .closest("figure")!
            .firstElementChild!.getBoundingClientRect();
          return {
            left: box.left - frame.left,
            top: box.top - frame.top,
            right: frame.right - box.right,
            bottom: frame.bottom - box.bottom,
            height: box.height,
            overflow: link.scrollWidth - link.clientWidth,
          };
        }),
      );
    expect(geometry).toHaveLength(2);
    for (const link of geometry) {
      expect(link.left).toBeGreaterThanOrEqual(0);
      expect(link.top).toBeGreaterThanOrEqual(0);
      expect(link.right).toBeGreaterThanOrEqual(0);
      expect(link.bottom).toBeGreaterThanOrEqual(0);
      expect(link.height).toBeGreaterThanOrEqual(44);
      expect(link.overflow).toBeLessThanOrEqual(1);
    }
  }
});

test("the opening animation settles and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const ball = page.locator("[data-court-motion]");
  const timings = await ball.evaluate((element) =>
    element.getAnimations().map((animation) => {
      const timing = animation.effect!.getTiming();
      animation.finish();
      return { duration: timing.duration, iterations: timing.iterations };
    }),
  );
  expect(timings).toHaveLength(1);
  expect(timings[0].duration).toBeLessThanOrEqual(4200);
  expect(timings[0].iterations).toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await ball.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
  await expect(ball).toBeVisible();
});

test("home tour clips load only on request and can be stopped", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("https://giphy.com/embed/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html><body>Tour clip test</body></html>",
    }),
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const pro = page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", { name: "Carlos Alcaraz", exact: true }),
    });
  await pro.scrollIntoViewIfNeeded();
  await expect(
    pro.getByRole("button", { name: "Play clip", exact: true }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await pro.getByRole("button", { name: "Play clip", exact: true }).tap();
  await expect(pro.locator("iframe")).toHaveAttribute(
    "src",
    /^https:\/\/giphy.com\/embed\//,
  );
  await pro.getByRole("button", { name: "Stop clip", exact: true }).tap();
  await expect(pro.locator("iframe")).toHaveCount(0);
});
