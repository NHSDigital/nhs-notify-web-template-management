/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import { test as teardown } from '@playwright/test';
import { CognitoUserHelper } from '../helpers/cognito-user-helper';

teardown('authenticate teardown', async () => {
  const userHelper = new CognitoUserHelper();

  const user = await userHelper.getUser(process.env.USER_EMAIL);

  if (user) {
    await userHelper.deleteUser(user.email);
  }
});
