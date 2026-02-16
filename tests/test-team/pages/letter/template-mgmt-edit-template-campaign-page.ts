import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtEditTemplateCampaignPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/edit-template-campaign/:templateId';

  campaignSelect: Locator;

  submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.campaignSelect = page.getByLabel('Edit template campaign');

    this.submitButton = page.getByRole('button', { name: 'Save changes' });
  }
}
