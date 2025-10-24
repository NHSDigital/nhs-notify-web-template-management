import { Locator, type Page } from '@playwright/test';

export abstract class TemplateMgmtBasePage {
  readonly page: Page;

  static readonly appUrlSegment = 'templates';

  static readonly pageUrlSegment: string;

  queryParameters?: URLSearchParams;

  readonly header: Locator;

  readonly headerLogoLink: Locator;

  readonly headerAccountDisplayName: Locator;

  readonly headerAccountClientName: Locator;

  readonly signInLink: Locator;

  readonly signOutLink: Locator;

  readonly headerNavigationLinks: Locator;

  readonly goBackLink: Locator;

  readonly pageHeading: Locator;

  readonly errorSummary: Locator;

  readonly errorSummaryHeading: Locator;

  readonly errorSummaryList: Locator;

  readonly skipLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByTestId('page-header');
    this.headerLogoLink = page.getByTestId('header-logo-service-link');

    this.headerAccountDisplayName = page.getByTestId('account-display-name');
    this.headerAccountClientName = page.getByTestId('account-client-name');

    this.signInLink = page.getByTestId('sign-in-link');
    this.signOutLink = page.getByTestId('sign-out-link');

    this.headerNavigationLinks = page.getByTestId('navigation-links');

    this.goBackLink = page
      .locator('.nhsuk-back-link')
      .and(page.getByText('Go back'));

    this.pageHeading = page.getByRole('heading', { level: 1 });

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

  abstract loadPage(idParameter?: string): Promise<void>;

  async attemptToLoadPageExpectFailure(idParameter?: string) {
    await this.loadPage(idParameter);
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickHeaderLogoLink() {
    await this.headerLogoLink.click();
  }

  async clickSignInLink() {
    await this.signInLink.click();
  }

  async clickBackLink() {
    await this.goBackLink.click();
  }
}
