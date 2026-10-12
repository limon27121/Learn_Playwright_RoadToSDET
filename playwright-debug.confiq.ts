//playwright.debug.config.ts


import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Central folder to store test artifacts like screenshots, videos, and traces
  outputDir: 'test-results/',

  // Increased per-test timeout from default 30s to 60s
  timeout: 60_000,

  // Run tests one by one for easier debugging
  fullyParallel: false,

  // Use only 1 worker to avoid parallel execution issues during debugging
  workers: process.env.CI ? 1 : 1,

  // Custom reporters
  reporter: [
    // HTML report will be generated inside playwright-report folder
    // open: 'never' means report will not open automatically after test run
    ['html', { outputFolder: 'playwright-report', open: 'never' }],

    // JSON report is useful for CI, tools, or machine-readable output
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    // Explicit viewport for consistent test execution
    viewport: {
      width: 1280,
      height: 720,
    },

    // Maximum time allowed for actions like click(), fill(), check()
    actionTimeout: 5_000,

    // Maximum time allowed for navigation like page.goto()
    navigationTimeout: 15_000,

    // Capture screenshot only when test fails
    screenshot: 'only-on-failure',

    // Record video only when test retries for the first time
    video: 'on-first-retry',

    // Keep trace for debugging failed retry attempts
    trace: 'on-first-retry',

    // Browser launch settings for debugging
    launchOptions: {
      // Run browser in visible mode
      headless: false,

      // Add 1 second delay between actions
      slowMo: 1000,
    },
  },

  projects: [
    {
      name: 'chromium',

      // Only Chromium is kept for focused debugging
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});