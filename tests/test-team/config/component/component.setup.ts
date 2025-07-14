/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { loginAsUser } from '../../helpers/auth/login-as-user';

setup('component test setup', async ({ page }) => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

  const auth = createAuthHelper();

  await auth.setup();

  const user = await auth.getTestUser(testUsers.User1.userId);

  await loginAsUser(user, page)

  await page.waitForURL('/templates/create-and-submit-templates');

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '.auth', 'user.json'),
  });
});
