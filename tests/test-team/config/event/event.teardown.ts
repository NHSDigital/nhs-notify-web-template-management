import { test as teardown } from '@playwright/test';
import { getTestContext } from 'helpers/context/context';

teardown('event test teardown', async () => {
  await getTestContext().teardown();
});
