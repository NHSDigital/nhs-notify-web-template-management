import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewPage } from '../template-mgmt-preview-page';

export class TemplateMgmtPreviewNhsAppPage extends TemplateMgmtPreviewPage {
  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly messageText: Locator;

  public readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editRadioOption = page.locator(
      '[id="reviewNHSAppTemplateAction-nhsapp-edit"]'
    );
    this.submitRadioOption = page.locator(
      '[id="reviewNHSAppTemplateAction-nhsapp-submit"]'
    );
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.messageText = page.locator('[id="preview-content-message"]');
    this.continueButton = page.locator(
      '[id="preview-nhs-app-template-submit-button"]'
    );
  }

  async loadPage(sessionId: string) {
    await this.navigateTo(`/templates/preview-nhs-app-template/${sessionId}`);
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
