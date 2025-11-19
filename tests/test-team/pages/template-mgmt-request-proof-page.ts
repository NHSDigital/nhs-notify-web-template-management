import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtRequestProofPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/request-proof-of-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/request-proof-of-template\/([\dA-Fa-f-]+)\?lockNumber=\d+$/
  );

  readonly requestProofButton: Locator;

  constructor(page: Page) {
    super(page);

    this.requestProofButton = page
      .locator('[id="request-proof-button"]')
      .and(page.getByRole('button'));
  }

  async clickRequestProofButton() {
    await this.requestProofButton.click();
  }
}
