import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtTemplateSubmittedPage extends TemplateMgmtBasePage {
  public readonly templateIdText: Locator;

  public readonly templateNameText: Locator;

  public readonly createAnotherTemplateLink: Locator;

  constructor(page: Page) {
    super(page);
    this.templateIdText = page.locator('[id="template-id"]');
    this.templateNameText = page.locator('[id="template-name"]');
    this.createAnotherTemplateLink = page.locator(
      '[id="create-another-template"]'
    );
  }

  async clickCreateAnotherTemplateLink() {
    await this.createAnotherTemplateLink.click();
  }

  async loadPage(templateId: string) {
    await this.navigateTo(`/templates/email-template-submitted/${templateId}`);
  }
}
