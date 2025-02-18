import { Locator, Page } from '@playwright/test';
import {
  CognitoAuthHelper,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class TemplateMgmtSignInPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'create-and-submit-templates';

  public readonly emailInput: Locator;

  public readonly passwordInput: Locator;

  public readonly confirmPasswordInput: Locator;

  public readonly submitButton: Locator;

  public readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirm_password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.amplify-alert__body');
  }

  async cognitoSignIn(user: TestUser) {
    await super.clickSignInLink();

    await this.emailInput.fill(user.email);

    await this.passwordInput.fill(user.password);

    await this.clickSubmitButton();

    let shouldResetPassword = true;

    try {
      await this.confirmPasswordInput.waitFor({
        state: 'visible',
        timeout: 5000,
      });
    } catch {
      shouldResetPassword = false;
    }

    // Note: because this is a new user, Cognito forces us to update the password.
    if (shouldResetPassword) {
      const password = CognitoAuthHelper.generatePassword();

      await this.passwordInput.fill(password);

      await this.confirmPasswordInput.fill(password);

      await this.clickSubmitButton();

      await user.setUpdatedPassword(password);
    }
  }

  async clickSubmitButton() {
    await this.submitButton.click();
  }
}
