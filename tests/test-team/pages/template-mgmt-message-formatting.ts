/* eslint-disable no-await-in-loop */
import { Locator, Page, expect } from '@playwright/test';

export class TemplateMgmtMessageFormatting {
  public readonly lineBreaksAndParagraphs: Locator;

  public readonly headings: Locator;

  public readonly bulletPoints: Locator;

  public readonly numberedList: Locator;

  public readonly horizontalLines: Locator;

  public readonly linksAndUrls: Locator;

  constructor(private readonly _page: Page) {
    this.lineBreaksAndParagraphs = this._page.locator(
      '[data-testid="lines-breaks-and-paragraphs-details"]'
    );

    this.headings = this._page.locator('[data-testid="headings-details"]');

    this.bulletPoints = this._page.locator(
      '[data-testid="bullet-lists-details"]'
    );

    this.numberedList = this._page.locator(
      '[data-testid="numbered-list-details"]'
    );

    this.horizontalLines = this._page.locator(
      '[data-testid="horizontal-lines-details"]'
    );

    this.linksAndUrls = this._page.locator(
      '[data-testid="link-and-url-details"]'
    );
  }

  async assertDetailsOpen(options: Array<Locator>) {
    // Note: promisify'ing this causes the test to become flakey.
    for (const option of options) {
      await option.click({ position: { x: 0, y: 0 } });
      await expect(option).toHaveAttribute('open');
    }
  }
}
