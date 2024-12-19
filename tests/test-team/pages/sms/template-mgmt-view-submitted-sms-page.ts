import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedPage } from '../template-mgmt-view-submitted-page';

export class TemplateMgmtViewSubmittedSMSPage extends TemplateMgmtViewSubmitedPage {
  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  async loadPage(templateId: string) {
    await this.navigateTo(
      `/templates/view-submitted-text-message-template/${templateId}`
    );
  }
}
