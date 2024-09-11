import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 10_000,

  projects: [
    {
      name: 'setup - session storage',
      testMatch: 'session.setup.ts',
      teardown: 'teardown - session storage',
    },
    {
      name: 'teardown - session storage',
      testMatch: 'session.teardown.ts',
    },
    {
      name: 'component',
      testMatch: '*.component.ts',
      dependencies: ['setup - session storage'],
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
    command: 'npm run dev --prefix ../../../',
    url: 'http://localhost:3000/templates/create-and-submit-templates',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
