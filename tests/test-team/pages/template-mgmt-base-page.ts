import { Locator, type Page } from '@playwright/test';

export abstract class TemplateMgmtBasePage {
  readonly page: Page;

  static readonly appUrlSegment = 'templates';

  static readonly pageUrlSegment: string;

  readonly notifyBannerLink: Locator;

  readonly signInLink: Locator;

  readonly signOutLink: Locator;

  readonly goBackLink: Locator;

  readonly pageHeader: Locator;

  readonly errorSummary: Locator;

  readonly errorSummaryHeading: Locator;

  readonly errorSummaryList: Locator;

  readonly skipLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.notifyBannerLink = page.locator(
      '[class="nhsuk-header__link nhsuk-header__link--service"]'
    );

    this.signInLink = page
      .locator('[data-testid="auth-link__link"]')
      .and(page.getByText('Sign in'));

    this.signOutLink = page
      .locator('[data-testid="auth-link__link"]')
      .and(page.getByText('Sign out'));

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

    this.skipLink = page
      .locator('[id="skip-link"]')
      .and(page.getByText('Skip to main content'));
  }

  abstract loadPage(templateId?: string): Promise<void>;

  async attemptToLoadPageExpectFailure(templateId?: string) {
    await this.loadPage(templateId);
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickNotifyBannerLink() {
    await this.notifyBannerLink.click();
  }

  async clickSignInLink() {
    await this.signInLink.click();
  }

  async clickBackLink() {
    await this.goBackLink.click();
  }
}
