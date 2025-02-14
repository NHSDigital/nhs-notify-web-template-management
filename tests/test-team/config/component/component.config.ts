import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 30_000, // 30 seconds in the playwright default
  expect: {
    timeout: 10_000, // default is 5 seconds. After creating and previewing sometimes the load is slow on a cold start
  },
  projects: [
    {
      name: 'component:setup',
      testMatch: 'component.setup.ts',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'component',
      testMatch: '*.component.spec.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: path.resolve(__dirname, '../.auth/user.json'),
      },
      dependencies: ['component:setup'],
      teardown: 'component:teardown',
    },
    {
      name: 'component:teardown',
      testMatch: 'component.teardown.ts',
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    timeout: 2 * 60 * 1000, // 2 minutes
    command: 'INCLUDE_AUTH_PAGES=true npm run build && npm run start',
    cwd: path.resolve(__dirname, '../../../..'),
    url: 'http://localhost:3000/templates/create-and-submit-templates',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
