import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedBasePage } from '../template-mgmt-view-submitted-base-page';

export class TemplateMgmtViewSubmittedEmailPage extends TemplateMgmtViewSubmitedBasePage {
  static readonly pageUrlSegment = 'preview-submitted-email-template';

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  public readonly submitTemplateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.submitTemplateButton = page.locator('[id="submit-template-button"]');
  }

  async clickSubmitTemplateButton() {
    await this.submitTemplateButton.click();
  }
}
