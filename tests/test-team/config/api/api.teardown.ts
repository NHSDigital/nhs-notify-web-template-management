import { test as setup } from '@playwright/test';
import { getTestContext } from 'helpers/context/context';

setup('api test teardown', async () => {
  await getTestContext().teardown();
});
