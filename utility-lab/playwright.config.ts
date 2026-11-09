import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: "list",
  outputDir: "outputs/test-results",
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: "msedge",
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
