import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["webkit.spec.ts", "map-focus.spec.ts"],
  workers: 1,
  timeout: 45_000,
  reporter: "list",
  outputDir: "outputs/webkit-results",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "webkit",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
