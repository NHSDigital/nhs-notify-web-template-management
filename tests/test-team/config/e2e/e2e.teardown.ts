import { test as teardown } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';

teardown('e2e test teardown', async () => {
  await createAuthHelper().teardown();
});
