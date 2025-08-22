import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 120_000,
  workers: 1,
  projects: [
    {
      name: 'event:setup',
      testMatch: 'event.setup.ts',
    },
    {
      name: 'event',
      testMatch: '*.event.spec.ts',
      dependencies: ['event:setup'],
      teardown: 'event:teardown',
    },
    {
      name: 'event:teardown',
      testMatch: 'event.teardown.ts',
    },
  ],
});
