import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtGetReadyToApproveLetterTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/get-ready-to-approve-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/get-ready-to-approve-letter-template\/[\dA-Fa-f-]+/
  );

  public readonly continueButton: Locator;
  public readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.backButton = page.getByRole('button', { name: 'Back' });
  }
}
