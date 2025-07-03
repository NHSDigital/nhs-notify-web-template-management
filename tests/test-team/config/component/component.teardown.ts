import { test as teardown } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';

teardown('component test teardown', async () => {
  await createAuthHelper().teardown();
});
