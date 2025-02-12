import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtDeletePage extends TemplateMgmtBasePage {
  static readonly pageUrlSegment = 'delete-template';

  readonly goBackButton: Locator;

  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.goBackButton = page.getByText('No, go back');
    this.confirmButton = page.getByText('Yes, delete template');
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtDeletePage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
