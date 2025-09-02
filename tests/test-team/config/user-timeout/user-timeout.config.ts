import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import baseConfig from '../playwright.config';

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

const buildCommand = [
  'INCLUDE_AUTH_PAGES=true',
  `NOTIFY_DOMAIN_NAME=localhost:${PORT}`,
  'NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS=25',
  'NEXT_PUBLIC_PROMPT_SECONDS_BEFORE_LOGOUT=5',
  `npm run build && npm run start -- -- -p ${PORT}`,
].join(' ');

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
        baseURL: BASE_URL,
        ...devices['Desktop Chrome'],
        headless: true,
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'modal',
      testMatch: 'template-mgmt-logout-warning.component.modal.spec.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: BASE_URL,
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: path.resolve(__dirname, '../.auth/user.json'),
      },
      timeout: 60_000,
      dependencies: ['component:setup'],
      teardown: 'component:teardown',
      fullyParallel: true, // make these sets of tests parallel due to their slow nature.
    },
    {
      name: 'component:teardown',
      testMatch: 'component.teardown.ts',
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    timeout: 2 * 60 * 1000, // 2 minutes
    command: buildCommand,
    cwd: path.resolve(__dirname, '../../../..'),
    url: `${BASE_URL}/templates/create-and-submit-templates`,
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
  },
});
