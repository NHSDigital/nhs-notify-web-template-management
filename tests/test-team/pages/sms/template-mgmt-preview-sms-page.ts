import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewSmsPage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegments = ['preview-text-message-template'];

  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly messageText: Locator;

  public readonly continueButton: Locator;

  public readonly editButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editRadioOption = page.locator(
      '[id="previewSMSTemplateAction-sms-edit"]'
    );
    this.submitRadioOption = page.locator(
      '[id="previewSMSTemplateAction-sms-submit"]'
    );
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.continueButton = page.locator(
      '[id="preview-sms-template-submit-button"]'
    );
    this.editButton = page.locator('[data-testid="edit-template-button"]');
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
