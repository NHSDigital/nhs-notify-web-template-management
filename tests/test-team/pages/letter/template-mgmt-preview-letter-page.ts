import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewLetterPage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate = '/preview-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/preview-letter-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/
  );

  public readonly errorSummary: Locator;
  public readonly continueButton: Locator;
  public readonly pdfLinks: Locator;
  public readonly campaignId: Locator;

  constructor(page: Page) {
    super(page);
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.continueButton = page.locator('[id="preview-letter-template-cta"]');
    this.pdfLinks = page.locator('[data-testid^="proof-link"]');
    this.campaignId = page.locator('[id="campaign-id"]');
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }

  static getTemplateId(url: string) {
    const matches = url.match(TemplateMgmtPreviewLetterPage.urlRegexp);

    if (matches && matches[1]) {
      return matches[1];
    }
  }
}
