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

  async getRowByTemplateId(id: string) {
    return this.page.locator(`tbody tr:has(td:nth-child(2):has-text("${id}"))`);
  }

  async getTemplateStatus(templateId: string) {
    const row = await this.getRowByTemplateId(templateId);

    const statusCell = row.locator('td:nth-child(4) .nhsuk-tag');

    return statusCell.textContent();
  }
}
