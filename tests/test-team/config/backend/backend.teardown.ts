import { test as setup } from '@playwright/test';
import { getTestContext } from 'helpers/context/context';

setup('backend test teardown', async () => {
  const context = getTestContext();
  await context.teardown();
});
