import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedPage } from '../template-mgmt-view-submitted-page';

export class TemplateMgmtViewSubmittedNhsAppPage extends TemplateMgmtViewSubmitedPage {
  static readonly pageRootUrl = 'view-submitted-nhs-app-template';

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtViewSubmittedNhsAppPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
