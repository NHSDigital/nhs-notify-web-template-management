import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

export default defineConfig({
  ...baseConfig,

  timeout: 30_000,
  projects: [
    {
      name: 'backend:setup',
      testMatch: 'backend.setup.ts',
      teardown: 'backend:teardown',
    },
    {
      name: 'backend',
      testMatch: '*.backend.spec.ts',
      dependencies: ['backend:setup'],
    },
    {
      name: 'backend:teardown',
      testMatch: 'backend.teardown.ts',
    },
  ],
});
