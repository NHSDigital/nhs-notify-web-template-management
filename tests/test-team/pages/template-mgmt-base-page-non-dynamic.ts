import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtBasePageNonDynamic extends TemplateMgmtBasePage {
  static readonly dynamicPage = false;

  constructor(page: Page) {
    super(page);
  }

  async loadPage() {
    const { appUrlSegment, pageUrlSegment } = this
      .constructor as typeof TemplateMgmtBasePageNonDynamic;

    if (!pageUrlSegment) {
      throw new Error('pageUrlSegment is not defined');
    }

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}`);
  }
}
