import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtBasePageNonDynamic extends TemplateMgmtBasePage {
  static readonly dynamicPage = false;

  constructor(page: Page) {
    super(page);
  }

  async loadPage() {
    const { appUrlSegment, pageUrlSegments } = this
      .constructor as typeof TemplateMgmtBasePageNonDynamic;

    if (!pageUrlSegments || pageUrlSegments.length !== 1) {
      throw new Error('Invalid pageUrlSegments');
    }

    let url = `/${appUrlSegment}/${pageUrlSegments[0]}`;

    if (this.queryParameters) {
      url += `?${this.queryParameters.toString()}`;
    }

    await this.navigateTo(url);
  }
}
