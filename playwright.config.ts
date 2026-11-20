import { defineConfig } from "@playwright/test";
import { join } from "node:path";
import { tmpdir } from "node:os";

const baseURL = process.env.BROWSER_BASE_URL || "http://127.0.0.1:3920";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.BROWSER_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: `${baseURL}/api/health`,
        reuseExistingServer: false,
        env: {
          PORT: "3920",
          APP_URL: baseURL,
          DATABASE_PATH: join(tmpdir(), `tried-kept-layout-${process.pid}.db`),
          MAIL_API_URL: "",
          MAIL_API_KEY: "",
          MAIL_FROM: "",
        },
      },
});
