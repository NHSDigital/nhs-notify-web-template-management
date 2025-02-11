import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedPage } from '../template-mgmt-view-submitted-page';

export class TemplateMgmtViewSubmittedSmsPage extends TemplateMgmtViewSubmitedPage {
  static readonly pageUrlRoot = 'view-submitted-text-message-template';

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtViewSubmittedSmsPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
