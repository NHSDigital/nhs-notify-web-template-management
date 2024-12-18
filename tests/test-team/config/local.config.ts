import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  globalSetup: './global.setup.ts',

  timeout: 10_000,

  projects: [
    {
      name: 'component',
      testMatch: '*.component.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
    {
      name: 'e2e-local',
      testMatch: '*-e2e.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: {
          slowMo: 0,
        },
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run test:start-local-app',
    url: 'http://localhost:3000/templates/create-and-submit-templates',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
