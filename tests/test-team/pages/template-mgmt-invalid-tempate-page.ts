import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtInvalidTemplatePage extends TemplateMgmtBasePage {
  constructor(page: Page) {
    super(page);
  }

  async loadPage() {
    await this.navigateTo('/templates/invalid-template');
  }
}
