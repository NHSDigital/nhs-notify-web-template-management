import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from './template-mgmt-base-page-dynamic';

export class TemplateMgmtDeletePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = ['delete-template'];

  readonly goBackButton: Locator;

  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.goBackButton = page.getByText('No, go back');
    this.confirmButton = page.getByText('Yes, delete template');
  }
}
