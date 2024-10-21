import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

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
      testMatch: '*.e2e.spec.ts',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'LOCAL_AUTH=true npm run test:start-local-app',
    url: 'http://localhost:3000/templates/create-and-submit-templates',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
