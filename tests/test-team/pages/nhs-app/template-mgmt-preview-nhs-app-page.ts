import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewNhsAppPage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate = '/preview-nhs-app-template/:templateId';

  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly messageText: Locator;

  public readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editRadioOption = page.locator(
      '[id="previewNHSAppTemplateAction-nhsapp-edit"]'
    );
    this.submitRadioOption = page.locator(
      '[id="previewNHSAppTemplateAction-nhsapp-submit"]'
    );
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.continueButton = page.locator(
      '[id="preview-nhs-app-template-submit-button"]'
    );
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
