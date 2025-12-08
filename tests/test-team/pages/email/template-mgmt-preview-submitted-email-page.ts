import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewSubmittedBasePage } from '../template-mgmt-preview-submitted-base-page';

export class TemplateMgmtPreviewSubmittedEmailPage extends TemplateMgmtPreviewSubmittedBasePage {
  static readonly pathTemplate =
    '/preview-submitted-email-template/:templateId';

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
  }
}
