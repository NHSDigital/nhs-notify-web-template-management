import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedBasePage } from '../template-mgmt-view-submitted-base-page';

export class TemplateMgmtViewSubmittedNhsAppPage extends TemplateMgmtViewSubmitedBasePage {
  static readonly pageUrlSegment = 'preview-submitted-nhs-app-template';

  public readonly messageText: Locator;

  public readonly submitTemplateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
    this.submitTemplateButton = page.locator('[id="submit-template-button"]');
  }

  async clickSubmitTemplateButton() {
    await this.submitTemplateButton.click();
  }
}
