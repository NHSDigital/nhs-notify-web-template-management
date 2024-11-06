import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtPreviewNhsAppPage extends TemplateMgmtBasePage {
  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly messageText: Locator;

  public readonly whoYourNhsAppNotificationWillBeSentFrom: Locator;

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
    this.whoYourNhsAppNotificationWillBeSentFrom = page.locator(
      '[data-testid="preview-message-details"]'
    );
  }

  async loadPage(sessionId: string) {
    await this.navigateTo(`/templates/preview-nhs-app-template/${sessionId}`);
  }
}
