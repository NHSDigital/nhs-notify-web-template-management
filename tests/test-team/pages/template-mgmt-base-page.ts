import { Locator, type Page } from '@playwright/test';

export class TemplateMgmtBasePage {
  readonly page: Page;

  readonly notifyBannerLink: Locator;

  readonly loginLink: Locator;

  readonly goBackLink: Locator;

  readonly pageHeader: Locator;

  readonly continueButton: Locator;

  readonly skipLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notifyBannerLink = page.locator(
      '[class="nhsuk-header__link nhsuk-header__link--service"]'
    );
    this.loginLink = page
      .locator('[class="nhsuk-account__login--link"]')
      .and(page.getByText('Log in'));
    this.goBackLink = page
      .locator('[class="nhsuk-back-link__link"]')
      .and(page.getByText('Go back'));
    this.pageHeader = page.locator('h1');
    this.continueButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Continue'));
    this.skipLink = page
      .locator('[id="skip-link"]')
      .and(page.getByText('Skip to main content'));
  }

  async navigateTo(url: string) {
    await this.page.goto(url, { waitUntil: 'load' });
  }

  async clickNotifyBannerLink() {
    await this.notifyBannerLink.click();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
