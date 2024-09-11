import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtStartPage extends TemplateMgmtBasePage {
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

  static templateOptions = [
    'NHS App messages',
    'emails',
    'text messages (SMS)',
    'letters',
  ];

  private static startPageUrl: string =
    '/templates/create-and-submit-templates';

  async navigateToStartPage() {
    await this.navigateTo(TemplateMgmtStartPage.startPageUrl);
  }

  async clickStartButton() {
    await this.startButton.click();
  }
}
