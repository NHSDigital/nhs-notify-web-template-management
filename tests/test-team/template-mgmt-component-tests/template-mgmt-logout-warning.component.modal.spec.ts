import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { loginAsUser } from '../helpers/auth/login-as-user';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Logout warning', () => {
  let staySignedInUser: TestUser;
  let manualSignOutUser: TestUser;
  let automaticallySignedOutUser: TestUser;

  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    staySignedInUser = await authHelper.getTestUser(testUsers.User3.userId);
    manualSignOutUser = await authHelper.getTestUser(testUsers.User4.userId);
    automaticallySignedOutUser = await authHelper.getTestUser(
      testUsers.User5.userId
    );
  });

  test('logout warning should pop up and close after clicking "Stay signed in"', async ({
    page,
  }) => {
    await loginAsUser(staySignedInUser, page);

    const dialog = page.locator('dialog');

    await dialog.waitFor({ state: 'visible', timeout: 25_000 });

    await dialog.getByRole('button', { name: 'Stay signed in' }).click();

    await expect(dialog).toBeHidden();
  });

  test('logout warning should pop up and close after user clicks "Sign out"', async ({
    page,
  }) => {
    await loginAsUser(manualSignOutUser, page);

    const dialog = page.locator('dialog');

    await dialog.waitFor({ state: 'visible', timeout: 25_000 });

    await dialog.getByRole('link', { name: 'Sign out' }).click();

    await expect(dialog).toBeHidden();
  });

  test('logout warning should force logout after timeout', async ({ page }) => {
    await loginAsUser(automaticallySignedOutUser, page);

    const dialog = page.locator('dialog');

    await dialog.waitFor({ state: 'visible', timeout: 25_000 });

    await page
      .getByRole('heading', { level: 1, name: "You've been signed out" })
      .waitFor({ state: 'visible', timeout: 10_000 });
  });
});
