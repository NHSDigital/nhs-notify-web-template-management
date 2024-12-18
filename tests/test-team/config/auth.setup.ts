/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import { test as setup } from '@playwright/test';
import { TemplateMgmtSignInPage } from '../pages/templates-mgmt-login-page';

setup('authenticate setup', async ({ page }) => {
  const loginPage = new TemplateMgmtSignInPage(page);

  await loginPage.loadPage();

  await loginPage.cognitoSignIn(process.env.USER_EMAIL);

  await page.waitForEvent('load');

  await page.context().storageState({ path: 'auth/user.json' });
});
