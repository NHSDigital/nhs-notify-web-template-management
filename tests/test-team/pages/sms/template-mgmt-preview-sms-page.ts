import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtPreviewSmsPage extends TemplateMgmtBasePage {
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

  async loadPage(templateId: string) {
    await this.navigateTo(
      `/templates/preview-text-message-template/${templateId}`
    );
  }
}
