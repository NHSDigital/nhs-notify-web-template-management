import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedBasePage } from '../template-mgmt-view-submitted-base-page';

export class TemplateMgmtViewSubmittedLetterPage extends TemplateMgmtViewSubmitedBasePage {
  static readonly pageUrlSegment = 'view-submitted-letter-template';

  public readonly submitTemplateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitTemplateButton = page.locator('[id="submit-template-button"]');
  }

  async clickSubmitTemplateButton() {
    await this.submitTemplateButton.click();
  }
}
