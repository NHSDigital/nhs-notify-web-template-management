import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedBasePage } from '../template-mgmt-view-submitted-base-page';

export class TemplateMgmtViewSubmittedNhsAppPage extends TemplateMgmtViewSubmitedBasePage {
  static readonly pageUrlSegment = 'view-submitted-nhs-app-template';

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtViewSubmittedNhsAppPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
