import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 10_000,

  expect: {
    timeout: 10_000,
  },

  projects: [
    {
      name: 'e2e-dev',
      testMatch: '*.e2e.ts',
      use: {
        screenshot: 'only-on-failure',
        baseURL: 'https://main.templates.dev.nhsnotify.national.nhs.uk',
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
});
