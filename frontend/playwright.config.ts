import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a production build of the site and a running Django
 * API (default http://127.0.0.1:8000, seeded with `manage.py seed_content`).
 * Admin tests need E2E_ADMIN_USERNAME / E2E_ADMIN_PASSWORD for a staff account.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 45_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@mobile/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/robots.txt`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
