import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtSignInPage } from '../pages/templates-mgmt-login-page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Logout warning', () => {
  let staySignedInUser: TestUser;
  let manualSignOutUser: TestUser;
  let automaticallySignedOutUser: TestUser;

  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    staySignedInUser = await authHelper.getTestUser(TestUserId.User3);
    manualSignOutUser = await authHelper.getTestUser(TestUserId.User4);
    automaticallySignedOutUser = await authHelper.getTestUser(TestUserId.User5);
  });

  test('logout warning should pop up and close after clicking "Stay signed in"', async ({
    page,
  }) => {
    const loginPage = new TemplateMgmtSignInPage(page);

    await loginPage.loadPage();

    await loginPage.cognitoSignIn(staySignedInUser);

    const dialog = page.locator('dialog');

    await dialog.waitFor({ state: 'visible', timeout: 25_000 });

    await dialog.getByRole('button', { name: 'Stay signed in' }).click();

    await expect(dialog).not.toBeVisible();
  });

  test('logout warning should pop up and close after user clicks "Sign out"', async ({
    page,
  }) => {
    const loginPage = new TemplateMgmtSignInPage(page);

    await loginPage.loadPage();

    await loginPage.cognitoSignIn(manualSignOutUser);

    const dialog = page.locator('dialog');

    await dialog.waitFor({ state: 'visible', timeout: 25_000 });

    await dialog.getByRole('link', { name: 'Sign out' }).click();

    await expect(dialog).not.toBeVisible();
  });

  test('logout warning should force logout after timeout', async ({ page }) => {
    const loginPage = new TemplateMgmtSignInPage(page);

    await loginPage.loadPage();

    await loginPage.cognitoSignIn(automaticallySignedOutUser);

    const dialog = page.locator('dialog');

    await dialog.waitFor({ state: 'visible', timeout: 25_000 });

    await page
      .getByRole('heading', { level: 1, name: "You've been signed out" })
      .waitFor({ state: 'visible', timeout: 10_000 });
  });
});
