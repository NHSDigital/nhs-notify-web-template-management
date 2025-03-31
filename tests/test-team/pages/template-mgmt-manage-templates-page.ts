import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class ManageTemplatesPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'manage-templates';

  readonly createTemplateButton: Locator;

  constructor(page: Page) {
    super(page);

    this.createTemplateButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Create template'));
  }

  async clickCreateTemplateButton() {
    await this.createTemplateButton.click();
  }
}
