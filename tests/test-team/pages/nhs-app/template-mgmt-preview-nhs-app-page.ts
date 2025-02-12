import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

export class TemplateMgmtPreviewNhsAppPage extends TemplateMgmtPreviewBasePage {
  public readonly editRadioOption: Locator;

  public readonly submitRadioOption: Locator;

  public readonly errorSummary: Locator;

  public readonly messageText: Locator;

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
  }

  static get pageUrlSegment() {
    return 'preview-nhs-app-template';
  }

  async loadPage(sessionId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtPreviewNhsAppPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${sessionId}`);
  }
}
