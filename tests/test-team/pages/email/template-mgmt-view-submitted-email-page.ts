import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedPage } from '../template-mgmt-view-submitted-page';

export class TemplateMgmtViewSubmittedEmailPage extends TemplateMgmtViewSubmitedPage {
  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  public readonly submitTemplateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.submitTemplateButton = page.locator('[id="submit-template-button"]');
  }

  async loadPage(templateId: string) {
    await this.navigateTo(
      `/templates/view-submitted-email-template/${templateId}`
    );
  }

  async clickSubmitTemplateButton() {
    await this.submitTemplateButton.click();
  }
}
