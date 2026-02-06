import path from 'node:path';
import { Locator, type Page } from '@playwright/test';

export abstract class TemplateMgmtBasePage {
  readonly page: Page;

  static readonly pathTemplate: string;

  static readonly appUrlSegment = 'templates';

  readonly header: Locator;

  readonly headerLogoLink: Locator;

  readonly headerAccountDisplayName: Locator;

  readonly headerAccountClientName: Locator;

  readonly signInLink: Locator;

  readonly signOutLink: Locator;

  readonly headerNavigationLinks: Locator;

  readonly backLinkTop: Locator;

  readonly backLinkBottom: Locator;

  readonly pageHeading: Locator;

  readonly errorSummary: Locator;

  readonly errorSummaryHeading: Locator;

  readonly errorSummaryHint: Locator;

  readonly errorSummaryList: Locator;

  readonly skipLink: Locator;

  protected pathParams = new Map<string, string | number>();

  protected searchParams = new URLSearchParams();

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByTestId('page-header');
    this.headerLogoLink = page.getByTestId('header-logo-service-link');

    this.headerAccountDisplayName = page.getByTestId('account-display-name');
    this.headerAccountClientName = page.getByTestId('account-client-name');

    this.signInLink = page.getByTestId('sign-in-link');
    this.signOutLink = page.getByTestId('sign-out-link');

    this.headerNavigationLinks = page.getByTestId('navigation-links');

    this.backLinkTop = page.getByTestId('back-link-top');

    this.backLinkBottom = page.getByTestId('back-link-bottom');

    this.pageHeading = page.getByRole('heading', { level: 1 });

    this.errorSummary = page.getByRole('alert', { name: 'There is a problem' });

    this.errorSummaryHeading = page.getByRole('heading', {
      level: 2,
      name: 'There is a problem',
    });

    this.errorSummaryHint = this.errorSummary.locator('.nhsuk-hint');

    this.errorSummaryList = this.errorSummary.getByRole('listitem');

    this.skipLink = page
      .locator('[id="skip-link"]')
      .and(page.getByText('Skip to main content'));
  }

  get pathTemplate() {
    return (this.constructor as typeof TemplateMgmtBasePage).pathTemplate;
  }

  /**
   * Returns the non-parameter segments from the path template
   * e.g. for a page with pathTemplate `/templates/preview-template/:id`
   * this method will return ['templates', 'preview-template']
   */
  static get staticPathSegments() {
    return this.pathTemplate
      .split('/')
      .filter((segment) => segment !== '' && !segment.startsWith(':'));
  }

  /**
   * Returns the names of the path parameters from the path template
   * e.g. for a page with pathTemplate `/templates/preview-template/:id`
   * this method will return ['id']
   */
  static get pathParameterNames() {
    return this.pathTemplate
      .split('/')
      .filter((segment) => segment.startsWith(':'))
      .map((segment) => segment.replace(/^:/, ''));
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

  async clickBackLinkTop() {
    await this.backLinkTop.click();
  }

  async clickTemplatesHeaderLink() {
    await this.headerNavigationLinks
      .getByRole('link', { name: 'Templates' })
      .click();
  }

  async clickMessagePlansHeaderLink() {
    await this.headerNavigationLinks
      .getByRole('link', { name: 'Message plans' })
      .click();
  }

  /**
   * Sets the value of a path parameter which will be interpolated into the pathTemplate when calling `getUrl` or `loadPage`
   * @param key The name of the path parameter to set
   * @param value The value of the path parameter
   * @returns this
   */
  setPathParam(key: string, value: string | number) {
    this.pathParams.set(key, value);
    return this;
  }

  /**
   * Sets the value of a search parameter which will be appended to the url when calling `getUrl` or `loadPage`
   * @param key The name of the search parameter to set
   * @param value The value of the search parameter
   * @returns this
   */
  setSearchParam(key: string, value: string) {
    this.searchParams.set(key, value);
    return this;
  }

  async loadPage() {
    await this.navigateTo(this.getUrl());
  }

  /**
   * Returns a formatted url for the page, based on the set path parameters and search parameters
   * e.g. if appUrlSegment is `templates`,
   * pathTemplate is `/request-proof-of-template/:templateId`,
   * the templateId path param has been set to '1' (`page.setPathParam('templateId', '1')`),
   * the lockNumber search param has been set to 1 (`page.setSearchParam('lockNumber, '1')`),
   * then this will return `/templates/request-proof-of-template/1?lockNumber=1`
   * @returns String
   */
  getUrl() {
    let url = path.join(
      '/',
      TemplateMgmtBasePage.appUrlSegment,
      this.formatPathTemplate()
    );

    if (this.searchParams.size > 0) {
      url += `?${this.searchParams.toString()}`;
    }

    return url;
  }

  async attemptToLoadPageExpectFailure() {
    await this.loadPage();
  }

  private formatPathTemplate() {
    return this.pathTemplate.replaceAll(
      /:([A-Za-z][\dA-Za-z]*)/g,
      (_, paramName) => {
        const value = this.pathParams.get(paramName);
        if (value === undefined || value === null || value === '') {
          throw new Error(
            `Missing parameter "${paramName}" from pathTemplate "${this.pathTemplate}".
            Make sure you have called TemplateMgmtBasePage.setPathParam to set the correct path parameters.`
          );
        }
        return String(value);
      }
    );
  }

  /**
   * Matches the current Playwright url against the `pathTemplate` and extracts the values of the path parameters.
   * If pathTemplate is `/copy-template/:templateId` and Playwright is currently on `localhost:3000/templates/copy-template/abc`,
   * This will return an object `{ templateId: 'abc' }`.
   * Will throw an error is the current URL does not match the pathTemplate
   * @returns Object
   */
  getPathParametersFromCurrentPageUrl() {
    const currentUrl = this.page.url();
    const urlPath = new URL(currentUrl).pathname;

    const relativePath = urlPath.replace(
      `/${TemplateMgmtBasePage.appUrlSegment}/`,
      ''
    );

    const normalizedPathTemplate = this.pathTemplate.startsWith('/')
      ? this.pathTemplate.slice(1)
      : this.pathTemplate;

    const regexPattern = normalizedPathTemplate.replaceAll(
      /:([A-Za-z][\dA-Za-z]*)/g,
      '([^/]+)'
    );

    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`^${regexPattern}$`);
    const urlMatch = relativePath.match(regex);

    if (!urlMatch) {
      throw new Error(
        `Current URL path "${relativePath}" does not match pathTemplate "${this.pathTemplate}".`
      );
    }

    const paramNames = [
      ...this.pathTemplate.matchAll(/:([A-Za-z][\dA-Za-z]*)/g),
    ].map((paramMatch) => paramMatch[1]);

    const params: Record<string, string> = {};

    for (const [index, name] of paramNames.entries()) {
      params[name] = urlMatch[index + 1];
    }

    return params;
  }
}
