import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 120_000,
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
      fullyParallel: true,
    },
    {
      name: 'event:teardown',
      testMatch: 'event.teardown.ts',
    },
  ],
});
