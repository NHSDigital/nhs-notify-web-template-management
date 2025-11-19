import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtUploadLetterMissingCampaignClientIdPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/upload-letter-template/client-id-and-campaign-id-required';

  public readonly errorDetailsInsetText: Locator;
  public readonly goBackLink: Locator;
  public readonly heading: Locator;

  constructor(page: Page) {
    super(page);

    this.errorDetailsInsetText = page.locator('[class="nhsuk-inset-text"] > p');
    this.goBackLink = page.getByTestId('back-link');
    this.heading = page.getByTestId('page-heading');
  }
}
