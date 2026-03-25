import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../helpers/context/context';
import { TemplateMgmtSignInPage } from '../pages/templates-mgmt-login-page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Logout warning', () => {
  let staySignedInUser: TestUser;
  let manualSignOutUser: TestUser;
  let automaticallySignedOutUser: TestUser;

  test.beforeAll(async () => {
    const context = getTestContext();

    staySignedInUser = await context.auth.getTestUser(testUsers.User3.userId);
    manualSignOutUser = await context.auth.getTestUser(testUsers.User4.userId);
    automaticallySignedOutUser = await context.auth.getTestUser(
      testUsers.User5.userId
    );
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

    await expect(dialog).toBeHidden();
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

    await expect(dialog).toBeHidden();
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
