import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewEmailPage extends TemplateMgmtPreviewBasePage {
  static readonly pageRootUrl = 'preview-email-template';

  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly subjectLineText: Locator;

  public readonly messageText: Locator;

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
  }

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtPreviewEmailPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
