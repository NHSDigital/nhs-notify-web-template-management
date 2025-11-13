import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class TemplateMgmtMessageTemplatesPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegments = ['message-templates'];

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
