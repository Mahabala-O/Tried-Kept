import { expect, test } from "@playwright/test";

for (const width of [320, 375, 390, 440, 768, 1280]) {
  test(`readable cards and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/",
      "/gear",
      "/pros",
      "/pros/naomi-osaka",
      "/gear/babolat-pure-aero-98-gen9",
      "/gear/compare?left=babolat-pure-aero-98-gen9&right=yonex-vcore-98-2026",
      "/gear/compare/resolution-9-vs-solution-speed-ff-4",
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
          expect(
            box!.height,
            `${route}: native picker tap target`,
          ).toBeGreaterThanOrEqual(44);
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
  for (const route of [
    "/",
    "/gear",
    "/pros",
    "/gear/compare?left=nike-vapor-12&right=nike-vapor-pro-3",
  ]) {
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
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
      route,
    ).toBeLessThanOrEqual(1);
    const compact = page.locator(".product-media-row").first();
    if (await compact.count()) {
      const frame = await compact.boundingBox();
      const content = await compact
        .locator(".product-media-content")
        .boundingBox();
      expect(content!.width).toBeGreaterThanOrEqual(frame!.width - 1);
    }
    const nav = page.getByRole("navigation", { name: "Quick", exact: true });
    await expect(nav.getByRole("link")).toHaveCount(3);
    for (const link of await nav.getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
});
