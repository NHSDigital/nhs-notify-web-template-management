/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import { TemplateMgmtSignInPage } from '../pages/templates-mgmt-login-page';
import { testUsers } from '../helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';

setup('UI test setup', async ({ page }) => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

  const context = getTestContext();

  await context.setup();

  const user = await context.auth.getTestUser(testUsers.User1.userId);

  const loginPage = new TemplateMgmtSignInPage(page);

  await loginPage.loadPage();

  await loginPage.cognitoSignIn(user);

  await page.waitForURL('/templates/create-and-submit-templates');

  await page.context().storageState({
    path: path.resolve(__dirname, '.auth', 'user.json'),
  });
});
