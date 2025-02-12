import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewPage } from '../template-mgmt-preview-page';

export class TemplateMgmtPreviewEmailPage extends TemplateMgmtPreviewPage {
  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  public readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editRadioOption = page.locator(
      '[id="reviewEmailTemplateAction-email-edit"]'
    );
    this.submitRadioOption = page.locator(
      '[id="reviewEmailTemplateAction-email-submit"]'
    );
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.continueButton = page.locator(
      '[id="preview-email-template-submit-button"]'
    );
  }

  async loadPage(templateId: string) {
    await this.navigateTo(`/templates/preview-email-template/${templateId}`);
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
