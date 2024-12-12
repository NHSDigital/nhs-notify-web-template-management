import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class ManageTemplatesPage extends TemplateMgmtBasePage {
  private static manageTemplatesPageUrl = '/templates/manage-templates';

  readonly createTemplateButton: Locator;

  constructor(page: Page) {
    super(page);

    this.createTemplateButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Create template'));
  }

  async loadPage(): Promise<void> {
    await this.navigateTo(ManageTemplatesPage.manageTemplatesPageUrl);
  }

  async clickCreateTemplateButton() {
    await this.createTemplateButton.click();
  }
}
