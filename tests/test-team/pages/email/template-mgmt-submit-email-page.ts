import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtSubmitEmailPage extends TemplateMgmtBasePage {
  public readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page
      .locator('[id="submit-template-button"]')
      .and(page.getByRole('button'));
  }

  async loadPage(sessionId: string) {
    await this.navigateTo(`/templates/submit-email-template/${sessionId}`);
  }

  async clickSubmitTemplateButton() {
    await this.submitButton.click();
  }
}
