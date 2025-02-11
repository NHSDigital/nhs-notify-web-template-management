import { Locator, Page } from '@playwright/test';
import { TemplateMgmtViewSubmitedPage } from '../template-mgmt-view-submitted-page';

export class TemplateMgmtViewSubmittedEmailPage extends TemplateMgmtViewSubmitedPage {
  static readonly pageUrlRoot = 'view-submitted-email-template';

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
  }

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtViewSubmittedEmailPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
