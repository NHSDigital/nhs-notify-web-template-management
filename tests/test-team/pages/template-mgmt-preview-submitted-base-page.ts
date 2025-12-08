import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtPreviewSubmitedBasePage extends TemplateMgmtBasePage {
  readonly campaignId: Locator;

  constructor(page: Page) {
    super(page);

    this.campaignId = page.locator('[id="campaign-id"]');
  }
}
