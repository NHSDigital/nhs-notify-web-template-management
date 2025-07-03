import { test as teardown } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';
import { createClientHelper } from '../../helpers/client/client-helper';

teardown('e2e test teardown', async () => {
  await createAuthHelper().teardown();
  await createClientHelper().teardown('e2e');
});
