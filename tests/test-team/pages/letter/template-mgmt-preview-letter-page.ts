import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewLetterPage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegment = 'preview-letter-template';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/preview-letter-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/
  );

  public readonly errorSummary: Locator;
  public readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.continueButton = page.locator('[id="preview-letter-template-cta"]');
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
