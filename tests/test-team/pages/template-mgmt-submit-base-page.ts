import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtSubmitBasePage extends TemplateMgmtBasePage {
  public readonly submitButton: Locator;

  public readonly goBackButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page
      .locator('[id="submit-template-button"]')
      .and(page.getByRole('button'));
    this.goBackButton = page
      .locator('[id="go-back-button"]')
      .and(page.getByRole('button'));
  }

  async clickSubmitTemplateButton() {
    await this.submitButton.click();
  }

  async clickGoBackButton() {
    await this.goBackButton.click();
  }
}
