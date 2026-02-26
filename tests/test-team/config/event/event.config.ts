import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  workers: 4, // 4 workers is the limit before User Auth starts failing in fully parallel mode
  timeout: 120_000,
  projects: [
    {
      name: 'event:setup',
      testMatch: 'event.setup.ts',
      teardown: 'event:teardown',
    },
    {
      name: 'event',
      testMatch: '*.event.spec.ts',
      dependencies: ['event:setup'],
      fullyParallel: true,
    },
    {
      name: 'event:teardown',
      testMatch: 'event.teardown.ts',
    },
  ],
});
