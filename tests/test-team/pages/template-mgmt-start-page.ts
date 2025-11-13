import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class TemplateMgmtStartPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegments = ['create-and-submit-templates'];

  readonly startButton: Locator;

  readonly listOfTemplates: Locator;

  constructor(page: Page) {
    super(page);
    this.startButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Start now'));
    this.listOfTemplates = page
      .getByRole('list')
      .and(this.page.locator('[class="nhsuk-list nhsuk-list--bullet"]'));
  }

  static readonly templateOptions = [
    'NHS App messages',
    'emails',
    'text messages (SMS)',
    'letters',
  ];

  async clickStartButton() {
    await this.startButton.click();
  }
}
