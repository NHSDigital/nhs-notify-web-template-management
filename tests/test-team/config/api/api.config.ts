import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 10_000,
  workers: 1,
  projects: [
    {
      name: 'api:setup',
      testMatch: 'api.setup.ts',
      teardown: 'api:teardown',
    },
    {
      name: 'api',
      testMatch: '*.api.spec.ts',
      dependencies: ['api:setup'],
    },
    {
      name: 'api:teardown',
      testMatch: 'api.teardown.ts',
    },
  ],
});
