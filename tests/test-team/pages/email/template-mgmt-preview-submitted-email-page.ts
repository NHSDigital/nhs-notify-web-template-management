import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewSubmitedBasePage } from '../template-mgmt-preview-submitted-base-page';

export class TemplateMgmtPreviewSubmittedEmailPage extends TemplateMgmtPreviewSubmitedBasePage {
  static readonly pageUrlSegments = ['preview-submitted-email-template'];

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
  }
}
