import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from './template-mgmt-base-page-dynamic';

export abstract class TemplateMgmtPreviewSubmitedBasePage extends TemplateMgmtBasePageDynamic {
  readonly backToAllTemplatesLinks: Locator;
  readonly campaignId: Locator;

  constructor(page: Page) {
    super(page);

    this.backToAllTemplatesLinks = page.getByText('Back to all templates');
    this.campaignId = page.locator('[id="campaign-id"]');
  }

  async clickBackToAllTemplatesTopLink() {
    await this.backToAllTemplatesLinks.nth(0).click();
  }

  async clickBackToAllTemplatesBottomLink() {
    await this.backToAllTemplatesLinks.nth(1).click();
  }
}
