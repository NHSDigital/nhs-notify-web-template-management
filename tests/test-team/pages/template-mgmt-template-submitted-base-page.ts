import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtTemplateSubmittedBasePage extends TemplateMgmtBasePage {
  public readonly templateIdText: Locator;

  public readonly templateNameText: Locator;

  public readonly createAnotherTemplateLink: Locator;

  public readonly goBackLink: Locator;

  constructor(page: Page) {
    super(page);
    this.templateIdText = page.locator('[id="template-id"]');
    this.templateNameText = page.locator('[id="template-name"]');
    this.createAnotherTemplateLink = page.locator(
      '[id="create-another-template"]'
    );
    this.goBackLink = page.locator('#go-back-link');
  }

  async clickCreateAnotherTemplateLink() {
    await this.createAnotherTemplateLink.click();
  }
}
