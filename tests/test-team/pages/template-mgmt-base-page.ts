import { Locator, type Page } from '@playwright/test';

export class TemplateMgmtBasePage {
  readonly page: Page;

  readonly notifyBannerLink: Locator;

  readonly loginLink: Locator;

  readonly goBackLink: Locator;

  readonly pageHeader: Locator;

  readonly errorSummary: Locator;

  readonly errorSummaryHeading: Locator;

  readonly errorSummaryList: Locator;

  readonly submitButton: Locator;

  readonly skipLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.notifyBannerLink = page.locator(
      '[class="nhsuk-header__link nhsuk-header__link--service"]'
    );

    this.loginLink = page
      .locator('[class="nhsuk-account__login--link"]')
      .and(page.getByText('Log in'));

    // Note: doing [class="nhsuk-back-link__link"] will not find the element if it has other class names
    this.goBackLink = page
      .locator('.nhsuk-back-link__link')
      .and(page.getByText('Go back'));

    this.pageHeader = page.getByRole('heading', { level: 1 });

    this.errorSummary = page.getByRole('alert', { name: 'There is a problem' });

    this.errorSummaryHeading = page.getByRole('heading', {
      level: 2,
      name: 'There is a problem',
    });

    this.errorSummaryList = this.errorSummary.getByRole('listitem');

    this.submitButton = page.locator('button.nhsuk-button[type="submit"]');

    this.skipLink = page
      .locator('[id="skip-link"]')
      .and(page.getByText('Skip to main content'));
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickNotifyBannerLink() {
    await this.notifyBannerLink.click();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }

  async clickButtonByName(buttonName: string) {
    await this.page.getByRole('button', { name: buttonName }).click();
  }

  async clickSubmitButton() {
    await this.submitButton.click();
  }

  async loadPage(_: string) {
    throw new Error('Not implemented');
  }

  async clickBackLink() {
    await this.goBackLink.click();
  }

  async fillTextBox(textBoxName: string, textBoxContent: string) {
    await this.page
      .getByRole('textbox', { name: textBoxName })
      .fill(textBoxContent);
  }

  async checkRadio(radioName: string) {
    await this.page.getByRole('radio', { name: radioName }).check();
  }
}
