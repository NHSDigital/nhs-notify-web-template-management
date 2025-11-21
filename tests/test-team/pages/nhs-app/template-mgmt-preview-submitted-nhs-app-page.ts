import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewSubmittedBasePage } from '../template-mgmt-preview-submitted-base-page';

export class TemplateMgmtPreviewSubmittedNhsAppPage extends TemplateMgmtPreviewSubmittedBasePage {
  static readonly pathTemplate =
    '/preview-submitted-nhs-app-template/:templateId';

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }
}
