import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from './template-mgmt-base-page-dynamic';

export abstract class TemplateMgmtPreviewSubmitedBasePage extends TemplateMgmtBasePageDynamic {
  readonly campaignId: Locator;

  constructor(page: Page) {
    super(page);

    this.campaignId = page.locator('[id="campaign-id"]');
  }
}
