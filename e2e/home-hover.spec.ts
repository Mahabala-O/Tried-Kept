import { expect, test } from "@playwright/test";

test.use({
  isMobile: false,
  hasTouch: false,
  viewport: { width: 1280, height: 900 },
  reducedMotion: "no-preference",
});

for (const [category, name] of [
  ["shoe", "shoes"],
  ["racquet", "racquets"],
] as const) {
  test(`${name} stay clickable across the raised picture edge`, async ({
    page,
  }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.getAnimations().forEach((animation) => animation.finish());
      });
      const link = page.getByRole("link", {
        name: `Explore ${name}`,
        exact: true,
      });
      const picture = page.locator(`[data-gear-picture="${category}"]`);
      const box = (await picture.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect
        .poll(() =>
          picture.evaluate(
            (element) => new DOMMatrix(getComputedStyle(element).transform).m42,
          ),
        )
        .toBeLessThan(-4.9);
      const points = await picture.evaluate((element) => {
        const rectangle = element.getBoundingClientRect();
        const matrix = new DOMMatrix(
          getComputedStyle(element.parentElement!).transform,
        );
        const width = (element as HTMLElement).offsetWidth;
        const height = (element as HTMLElement).offsetHeight;
        // Probe the visible top edge, including the strip lifted above the tile's layout box.
        return [-width / 4, 0, width / 4].map((x) => {
          const offset = new DOMPoint(x, -height / 2 + 2, 0, 0).matrixTransform(
            matrix,
          );
          return {
            x: rectangle.x + rectangle.width / 2 + offset.x,
            y: rectangle.y + rectangle.height / 2 + offset.y,
          };
        });
      });
      for (const point of points) {
        await page.mouse.move(point.x, point.y);
        expect(
          await page.evaluate(
            ({ x, y }) =>
              document
                .elementFromPoint(x, y)
                ?.closest("a")
                ?.getAttribute("href"),
            point,
          ),
        ).toBe(`/gear?category=${category}`);
        await expect
          .poll(() => link.evaluate((element) => element.matches(":hover")))
          .toBe(true);
      }
      await page.mouse.click(points[1].x, points[1].y);
      await expect(page).toHaveURL(new RegExp(`/gear\\?category=${category}$`));
    }
  });
}

test("each full gear tile is one keyboard focus target", async ({ page, browserName }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const shoes = page.getByRole("link", { name: "Explore shoes", exact: true });
  const racquets = page.getByRole("link", {
    name: "Explore racquets",
    exact: true,
  });
  await shoes.focus();
  await page.keyboard.press("Tab");
  let optionTab = false;
  // Safari's macOS preference can exclude hyperlinks from plain Tab navigation.
  // Linux WebKit normally includes them, so use Option+Tab only when needed.
  if (
    browserName === "webkit" &&
    !(await racquets.evaluate((element) => element === document.activeElement))
  ) {
    optionTab = true;
    await shoes.focus();
    await page.keyboard.press("Alt+Tab");
  }
  await expect(racquets).toBeFocused();
  await expect(racquets.locator("img")).toHaveCount(1);
  await expect(racquets).toHaveCSS("outline-style", "solid");
  await page.keyboard.press(optionTab ? "Shift+Alt+Tab" : "Shift+Tab");
  await expect(shoes).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/gear\?category=shoe$/);
});
