import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewSmsPage extends TemplateMgmtPreviewBasePage {
    static readonly pageUrlSegment = 'preview-text-message-template'

  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly messageText: Locator;

  constructor(page: Page) {
    super(page);
    this.editRadioOption = page.locator(
      '[id="reviewSMSTemplateAction-sms-edit"]'
    );
    this.submitRadioOption = page.locator(
      '[id="reviewSMSTemplateAction-sms-submit"]'
    );
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.messageText = page.locator('[id="preview-content-message"]');
  }
}
