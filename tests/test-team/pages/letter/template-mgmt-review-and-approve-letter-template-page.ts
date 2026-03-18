import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtReviewAndApproveLetterTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/review-and-approve-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/review-and-approve-letter-template\/([\dA-Fa-f-]+)$/
  );

  readonly approveButton: Locator;

  constructor(page: Page) {
    super(page);

    this.approveButton = page
      .locator('[id="review-and-approve-letter-cta"]')
      .and(page.getByRole('button'));
  }

  async clickApproveButton() {
    await this.approveButton.click();
  }
}
