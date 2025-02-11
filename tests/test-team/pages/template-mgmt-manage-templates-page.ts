import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class ManageTemplatesPage extends TemplateMgmtBasePage {
  static readonly pageUrlRoot = 'manage-templates';

  readonly createTemplateButton: Locator;

  constructor(page: Page) {
    super(page);

    this.createTemplateButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Create template'));
  }

  async loadPage(): Promise<void> {
    const { appRootUrl, pageUrlRoot } = ManageTemplatesPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}`);
  }

  async clickCreateTemplateButton() {
    await this.createTemplateButton.click();
  }
}
