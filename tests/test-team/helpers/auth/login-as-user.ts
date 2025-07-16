import { Page } from '@playwright/test';
import { TestUser } from './cognito-auth-helper';
import { TemplateMgmtSignInPage } from '../../pages/templates-mgmt-login-page';

export const loginAsUser = async (user: TestUser, page: Page) => {
  const loginPage = new TemplateMgmtSignInPage(page);

  await loginPage.loadPage();

  await loginPage.cognitoSignIn(user);

  await page.waitForURL('/templates/create-and-submit-templates');
};
