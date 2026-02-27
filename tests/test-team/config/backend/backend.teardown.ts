import { test as setup } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';

setup('backend test teardown', async () => {
  await createAuthHelper().teardown();
});
