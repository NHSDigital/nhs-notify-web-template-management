import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from './template-mgmt-base-page-dynamic';

export class TemplateMgmtRequestProofPage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = ['request-proof-of-template'];

  public static readonly urlRegexp = new RegExp(
    /\/templates\/request-proof-of-template\/([\dA-Fa-f-]+)$/
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
