import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtSubmitPage extends TemplateMgmtBasePage {
  public readonly submitButton: Locator;

  constructor(
    page: Page,
    private readonly channelIdentifier: string
  ) {
    super(page);
    this.submitButton = page
      .locator('[id="submit-template-button"]')
      .and(page.getByRole('button'));
  }

  async loadPage(templateId: string) {
    await this.navigateTo(
      `/templates/submit-${this.channelIdentifier}-template/${templateId}`
    );
  }

  async clickSubmitTemplateButton() {
    await this.submitButton.click();
  }
}
