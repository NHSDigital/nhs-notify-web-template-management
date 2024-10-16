import { Locator, type Page, expect } from '@playwright/test';

export class TemplateMgmtBasePage {
  readonly page: Page;

  readonly notifyBannerLink: Locator;

  readonly goBackLink: Locator;

  readonly pageHeader: Locator;

  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notifyBannerLink = page.locator(
      '[class="nhsuk-header__link nhsuk-header__link--service"]'
    );
    this.goBackLink = page
      .locator('[class="nhsuk-back-link__link"]')
      .and(page.getByText('Go back'));
    this.pageHeader = page
      .locator('[data-testid="page-heading"]')
      .and(page.locator('h1'));
    this.continueButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Continue'));
  }

  async navigateTo(url: string) {
    await this.page.goto(url, { waitUntil: 'load' });
  }

  async clickNotifyBannerLink() {
    await this.notifyBannerLink.click();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }

  async signIn(email: string, password: string) {
    await this.navigateTo('/templates/create-and-submit-templates');
    const signinLink = this.page.getByText('Sign in');

    await signinLink.click();

    const emailInput = this.page.getByPlaceholder('Enter your Email');
    await emailInput.fill(email);

    const passwordInput = this.page.getByPlaceholder('Enter your Password');
    await passwordInput.fill(password);

    const signinButton = this.page.getByRole('button', { name: 'Sign in' });
    await signinButton.click();

    await expect(this.page).toHaveURL('/templates/create-and-submit-templates');
  }
}
