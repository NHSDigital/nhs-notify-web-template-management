import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedBasePage } from '../template-mgmt-view-submitted-base-page';

export class TemplateMgmtViewSubmittedSmsPage extends TemplateMgmtViewSubmitedBasePage {
  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  static get pageUrlSegment() {
    return 'view-submitted-text-message-template';
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtViewSubmittedSmsPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
