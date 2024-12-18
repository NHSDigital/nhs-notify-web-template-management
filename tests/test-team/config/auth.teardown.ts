/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import { test as teardown } from '@playwright/test';
import { CognitoUserHelper } from '../helpers/cognito-user-helper';

teardown('authenticate teardown', async () => {
  const userHelper = new CognitoUserHelper();

  const user = await userHelper.getUser(process.env.USER_EMAIL);

  if (user) {
    // TODO: undo this
    // await userHelper.deleteUser(user.email);
  }

  // TODO: delete this.
  console.log({
    USER_EMAIL: process.env.USER_EMAIL,
    USER_ID: process.env.USER_ID,
    USER_TEMPORARY_PASSWORD: process.env.USER_TEMPORARY_PASSWORD,
    USER_PASSWORD: process.env.USER_PASSWORD,
  });
});
