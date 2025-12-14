import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for @ownui/tw-theme plugin E2E tests
 *
 * Tests validate that compiled CSS works correctly in a real browser.
 */
export default defineConfig({
  // Test directory
  testDir: "./tests",

  // Timeout for each test
  timeout: 30000,

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Number of workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],

  // Shared configuration
  use: {
    // Base URL for development server
    baseURL: "http://localhost:3456",

    // Screenshots on failure
    screenshot: "only-on-failure",

    // Videos only on first retry failure
    video: "retain-on-failure",

    // Trace
    trace: "on-first-retry",
  },

  // Project configuration (browsers)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web server
  webServer: {
    command: "cd .. && npx sirv e2e/dist --port 3456 --cors --single",
    port: 3456,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
