import { test as setup } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';

setup('event test teardown', async () => {
  await createAuthHelper().teardown();
});
