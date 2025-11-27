import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewEmailPage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate = '/preview-email-template/:templateId';

  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  public readonly continueButton: Locator;

  public readonly editButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editRadioOption = page.locator(
      '[id="previewEmailTemplateAction-email-edit"]'
    );
    this.submitRadioOption = page.locator(
      '[id="previewEmailTemplateAction-email-submit"]'
    );
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.subjectLineText = page.locator('[id="preview-content-subject"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.continueButton = page.locator(
      '[id="preview-email-template-submit-button"]'
    );
    this.editButton = page.locator('[data-testid="edit-template-button"]');
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
