import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class ManageTemplatesPage extends TemplateMgmtBasePage {
  readonly createTemplateButton: Locator;

  constructor(page: Page) {
    super(page);

    this.createTemplateButton = page
      .locator('[class="nhsuk-button"]')
      .and(page.getByRole('button'))
      .and(page.getByText('Create template'));
  }

  static get pageUrlSegment() {
    return 'manage-templates';
  }

  async loadPage(): Promise<void> {
    const { appUrlSegment, pageUrlSegment } = ManageTemplatesPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}`);
  }

  async clickCreateTemplateButton() {
    await this.createTemplateButton.click();
  }
}
