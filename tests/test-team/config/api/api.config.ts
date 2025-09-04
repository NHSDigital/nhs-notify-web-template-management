import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 10_000,
  projects: [
    {
      name: 'api:setup',
      testMatch: 'api.setup.ts',
    },
    {
      name: 'api',
      testMatch: '*.api.spec.ts',
      dependencies: ['api:setup'],
      teardown: 'api:teardown',
    },
    {
      name: 'api:teardown',
      testMatch: 'api.teardown.ts',
    },
  ],
});
