import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme} theme keeps the core journeys readable`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    for (const route of [
      "/",
      "/gear",
      "/gear/babolat-pure-aero-98-gen9",
      "/pros",
      "/pros/iga-swiatek",
      "/pros/iga-swiatek/stories/iga-swiatek-a-switch-worth-waiting-for",
      "/gear/compare?left=nike-vapor-12&right=nike-vapor-pro-3",
      "/gear/compare/resolution-9-vs-solution-speed-ff-4",
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const failures = await page.evaluate(() => {
        const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
        const luminance = (color: number[]) =>
          color.slice(0, 3).reduce((sum, channel, index) => {
            const value = channel / 255;
            return (
              sum +
              [0.2126, 0.7152, 0.0722][index] *
                (value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4)
            );
          }, 0);
        const failures: string[] = [];
        for (const element of document.querySelectorAll("body *")) {
          if (
            !Array.from(element.childNodes).some(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
            ) ||
            element.closest("script, style, svg, option, optgroup") ||
            !element.checkVisibility()
          )
            continue;
          let ancestor: Element | null = element;
          let background: number[] | undefined;
          while (ancestor) {
            const style = getComputedStyle(ancestor);
            // Photos and gradients require visual review; their contrast is not a single color.
            if (style.backgroundImage !== "none") break;
            const color = rgb(style.backgroundColor);
            if (color.length === 3 || color[3] === 1) {
              background = color;
              break;
            }
            if (color[3] !== 0) break;
            ancestor = ancestor.parentElement;
          }
          if (!background) continue;
          const style = getComputedStyle(element);
          const foreground = rgb(style.color);
          if (foreground.length === 4 && foreground[3] !== 1) continue;
          const light = luminance(foreground),
            dark = luminance(background);
          const ratio =
            (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
          const large =
            parseFloat(style.fontSize) >= 24 ||
            (parseFloat(style.fontSize) >= 18.66 &&
              parseInt(style.fontWeight) >= 700);
          if (ratio < (large ? 3 : 4.5) - 0.02) {
            failures.push(
              `${element.textContent?.trim().slice(0, 60)}: ${ratio.toFixed(2)}:1`,
            );
          }
        }
        return failures;
      });
      expect(failures, `${route}: text on solid surfaces`).toEqual([]);
    }

    await page.getByRole("button", { name: "Menu", exact: true }).tap();
    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /^Catalogue/ })).toBeVisible();
    const menuColors = await menu.evaluate((element) => ({
      color: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor,
    }));
    expect(menuColors.color).not.toBe(menuColors.background);
  });
}

test("system theme changes preserve product photography and update browser chrome", async ({
  page,
}) => {
  await page.goto("/gear/babolat-pure-aero-98-gen9", {
    waitUntil: "domcontentloaded",
  });
  const photo = page.locator(".product-photo").first();
  const appearance = () =>
    photo.evaluate((element) => {
      const image = element.querySelector("img")!;
      return {
        background: getComputedStyle(element).backgroundColor,
        filter: getComputedStyle(image).filter,
        blend: getComputedStyle(image).mixBlendMode,
        width: image.getBoundingClientRect().width,
      };
    });
  await page.emulateMedia({ colorScheme: "light" });
  const lightPhoto = await appearance();
  const lightBody = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await appearance()).toEqual(lightPhoto);
  const darkBody = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(darkBody).not.toBe(lightBody);
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
    "content",
    "light dark",
  );
  await expect(
    page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: dark)"]',
    ),
  ).toHaveCount(1);
  await expect(
    page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: light)"]',
    ),
  ).toHaveCount(1);
});
