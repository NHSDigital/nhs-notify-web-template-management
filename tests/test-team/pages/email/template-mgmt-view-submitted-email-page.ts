import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedBasePage } from '../template-mgmt-view-submitted-base-page';

export class TemplateMgmtViewSubmittedEmailPage extends TemplateMgmtViewSubmitedBasePage {
  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  static get pageUrlSegment() {
    return 'view-submitted-email-template';
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } =
      TemplateMgmtViewSubmittedEmailPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
