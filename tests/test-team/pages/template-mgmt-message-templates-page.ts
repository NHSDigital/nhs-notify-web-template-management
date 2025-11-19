import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtMessageTemplatesPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/message-templates';

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
