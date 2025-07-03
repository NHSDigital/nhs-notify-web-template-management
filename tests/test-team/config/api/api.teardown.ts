import { test as setup } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';
import { createClientHelper } from '../../helpers/client/client-helper';

setup('api test teardown', async () => {
  await createAuthHelper().teardown();
  await createClientHelper().teardown('api');
});
