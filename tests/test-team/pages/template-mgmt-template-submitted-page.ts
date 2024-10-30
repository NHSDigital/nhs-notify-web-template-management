import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtTemplateSubmittedPage extends TemplateMgmtBasePage {
  public readonly templateIdText: Locator;

  public readonly templateNameText: Locator;

  public readonly createAnotherTemplateLink: Locator;

  public readonly serviceNowLink: Locator;

  constructor(
    page: Page,
    private readonly channelIdentifier: string
  ) {
    super(page);
    this.templateIdText = page.locator('[id="template-id"]');
    this.templateNameText = page.locator('[id="template-name"]');
    this.createAnotherTemplateLink = page.locator(
      '[id="create-another-template"]'
    );
    this.serviceNowLink = page.locator('[id="servicenow-link"]');
  }

  async clickCreateAnotherTemplateLink() {
    await this.createAnotherTemplateLink.click();
  }

  async loadPage(templateId: string) {
    await this.navigateTo(
      `/templates/${this.channelIdentifier}-template-submitted/${templateId}`
    );
  }
}
