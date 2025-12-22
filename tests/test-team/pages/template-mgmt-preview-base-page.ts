import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtPreviewBasePage extends TemplateMgmtBasePage {
  readonly templateCaption: Locator;

  readonly templateId: Locator;

  readonly campaignId: Locator;

  readonly summaryList: Locator;

  constructor(page: Page) {
    super(page);
    this.templateCaption = page.locator('.nhsuk-caption-l');
    this.templateId = page.getByTestId('preview-template-id');
    this.campaignId = page.locator('[id="campaign-id"]');
    this.summaryList = page.locator('dl.nhsuk-summary-list');
  }
}
