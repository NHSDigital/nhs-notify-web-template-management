import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtSignInPage extends TemplateMgmtBasePage {
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

  async cognitoSignIn(email: string) {
    await this.emailInput.fill(email);

    await this.passwordInput.fill(process.env.USER_TEMPORARY_PASSWORD);

    await this.clickSubmitButton();

    // Note: because this is a new user Cognito forces us to update the password.
    await this.cognitoUpdateUserPassword();

    await this.clickSubmitButton();
  }

  async cognitoUpdateUserPassword() {
    await this.passwordInput.fill(process.env.USER_PASSWORD);

    await this.confirmPasswordInput.fill(process.env.USER_PASSWORD);
  }

  async clickSubmitButton() {
    await this.submitButton.click();
  }

  async loadPage() {
    await this.page.goto('/templates/create-and-submit-templates');
    await super.clickLoginLink();
  }
}
