import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewSubmitedBasePage } from '../template-mgmt-preview-submitted-base-page';

export class TemplateMgmtPreviewSubmittedNhsAppPage extends TemplateMgmtPreviewSubmitedBasePage {
  static readonly pageUrlSegments = ['preview-submitted-nhs-app-template'];

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.messageText = page.locator('[id="preview-content-message"]');
  }
}
