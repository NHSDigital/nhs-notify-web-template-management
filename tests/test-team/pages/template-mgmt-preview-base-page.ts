import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtPreviewBasePage extends TemplateMgmtBasePage {
  readonly backToAllTemplatesLinks: Locator;

  constructor(page: Page) {
    super(page);

    this.backToAllTemplatesLinks = page.getByText('Back to all templates');
  }

  async clickBackToAllTemplatesTopLink() {
    await this.backToAllTemplatesLinks.nth(0).click();
  }

  async clickBackToAllTemplatesBottomLink() {
    await this.backToAllTemplatesLinks.nth(1).click();
  }
}
