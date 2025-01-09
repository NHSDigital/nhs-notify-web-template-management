import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 15_000,

  projects: [
    {
      name: 'auth-setup',
      testMatch: 'auth.setup.ts',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'component',
      testMatch: '*.component.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: './auth/user.json',
      },
      dependencies: ['auth-setup'],
      teardown: 'auth-teardown',
    },
    {
      name: 'e2e-local',
      testMatch: '*.e2e.spec.ts',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'auth-teardown',
      testMatch: 'auth.teardown.ts',
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    timeout: 2 * 60 * 1000, // 2 minutes
    command: 'npm run test:start-local-app',
    url: 'http://localhost:3000/templates/create-and-submit-templates',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
