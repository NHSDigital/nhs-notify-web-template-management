import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtReviewAndApproveLetterTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/review-and-approve-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/review-and-approve-letter-template\/([\dA-Fa-f-]+)(?:\?lockNumber=(\d))?$/
  );

  readonly approveButton: Locator;
  readonly shortRenderIFrame: Locator;
  readonly longRenderIFrame: Locator;

  constructor(page: Page) {
    super(page);

    this.approveButton = page.getByRole('button', { name: 'Approve' });
    this.shortRenderIFrame = page.locator(
      'iframe[title="Letter preview - short examples"]'
    );
    this.longRenderIFrame = page.locator(
      'iframe[title="Letter preview - long examples"]'
    );
  }

  async clickApproveButton() {
    await this.approveButton.click();
  }
}
