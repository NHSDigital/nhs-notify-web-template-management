/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import { TemplateMgmtSignInPage } from '../../pages/templates-mgmt-login-page';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

setup('e2e test setup', async ({ page }) => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

  const auth = createAuthHelper();

  await auth.setup();

  const user = await auth.getTestUser(testUsers.User1.userId);

  const loginPage = new TemplateMgmtSignInPage(page);

  await loginPage.loadPage();

  await loginPage.cognitoSignIn(user);

  await page.waitForURL('/templates/create-and-submit-templates');

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '.auth', 'e2e', 'user.json'),
  });
});
