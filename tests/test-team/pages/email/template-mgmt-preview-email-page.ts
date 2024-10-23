import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtPreviewEmailPage extends TemplateMgmtBasePage {
  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

  public readonly whoYourEmailWillBeSentFrom: Locator;

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
    this.whoYourEmailWillBeSentFrom = page.locator(
      '[data-testid="preview-message-details"]'
    );
  }

  async loadPage(sessionId: string) {
    await this.navigateTo(`/templates/preview-email-template/${sessionId}`);
  }
}
