import { expect, test } from "@playwright/test";

for (const width of [320, 375, 390, 440, 768, 1280]) {
  test(`readable cards and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/",
      "/pros",
      "/compare",
      "/compare/resolution-9-vs-solution-speed-ff-4",
      "/switch?current=asics-gel-resolution-9",
    ]) {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
        route,
      ).toBeLessThanOrEqual(1);
      // Overflow clipping alone can hide layout failures. Inspect each compact figure's geometry.
      const captions = await page
        .locator(".product-media-row > .media-credit")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const caption = node.getBoundingClientRect();
            const frame = node.parentElement!.getBoundingClientRect();
            const picture = node
              .parentElement!.querySelector(".media-box")!
              .getBoundingClientRect();
            return {
              width: caption.width,
              frameWidth: frame.width,
              top: caption.top,
              pictureBottom: picture.bottom,
            };
          }),
        );
      for (const caption of captions) {
        expect(
          caption.width,
          `${route}: a caption must not be thumbnail-width`,
        ).toBeGreaterThanOrEqual(caption.frameWidth - 1);
        expect(caption.top).toBeGreaterThanOrEqual(caption.pictureBottom);
      }
      if (route === "/pros") expect(captions.length).toBeGreaterThan(0);
      if (width <= 440) {
        for (const select of await page.locator("main select").all()) {
          const box = await select.boundingBox();
          expect(box!.height, `${route}: native picker tap target`).toBeGreaterThanOrEqual(44);
        }
      }
      await expect(page.locator("main")).not.toContainText(
        /\bXP\b|Leaderboard/,
      );
    }
  });
}

test("text enlargement reflows controls and compact content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/pros", "/switch?current=asics-gel-resolution-9"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    for (const selector of [".site-header", ".bottom-nav"]) {
      await expect
        .poll(() =>
          page
            .locator(selector)
            .evaluate((el) => el.scrollWidth - el.clientWidth),
        )
        .toBeLessThanOrEqual(1);
    }
    const compact = page.locator(".product-media-row").first();
    const frame = await compact.boundingBox();
    const content = await compact
      .locator(".product-media-content")
      .boundingBox();
    expect(content!.width).toBeGreaterThanOrEqual(frame!.width - 1);
    const nav = page.getByRole("navigation", { name: "Quick", exact: true });
    await expect(nav.getByRole("link")).toHaveCount(5);
    for (const link of await nav.getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("switch preferences survive reload and trial context survives login redirect", async ({
  page,
}) => {
  await page.goto("/switch?current=asics-gel-resolution-9");
  await page.getByLabel("More room", { exact: true }).tap();
  await expect(page).toHaveURL(/priority=room/);
  await page.reload();
  await expect(page.getByLabel("More room", { exact: true })).toBeChecked();
  const trial = page
    .getByRole("link", { name: "Tried it? Log the switch", exact: true })
    .first();
  const href = await trial.getAttribute("href");
  const evidence = page
    .getByRole("link", { name: "Evidence & save to locker", exact: true })
    .first();
  await evidence.tap();
  await page.waitForURL("**/gear/**?from=asics-gel-resolution-9", {
    waitUntil: "domcontentloaded",
  });
  const productTrial = page.getByRole("link", {
    name: "Tried it? Tell your story",
    exact: true,
  });
  expect(await productTrial.getAttribute("href")).toBe(href);
  await productTrial.tap();
  await page.waitForURL("**/login?**");
  expect(new URL(page.url()).searchParams.get("next")).toBe(href);
  await page.goto("/switch?current=asics-gel-resolution-9");
  await page
    .getByLabel("Where will you play?", { exact: true })
    .selectOption("clay");
  await expect(page.getByRole("status")).toContainText("0 candidates");
  await expect(
    page.getByRole("link", { name: "Tried it? Log the switch", exact: true }),
  ).toHaveCount(0);
});
