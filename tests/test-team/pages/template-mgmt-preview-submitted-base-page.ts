import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtPreviewSubmittedBasePage extends TemplateMgmtBasePage {
  readonly campaignId: Locator;
  readonly copyLink: Locator;
  readonly statusTag: Locator;

  constructor(page: Page) {
    super(page);

    this.campaignId = page.locator('[id="campaign-id"]');
    this.copyLink = page.getByTestId('copy-link');
    this.statusTag = page.getByTestId('status-tag');
  }
}
