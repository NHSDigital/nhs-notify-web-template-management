import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtBasePageDynamic extends TemplateMgmtBasePage {
  static readonly dynamicPage = true;

  constructor(page: Page) {
    super(page);
  }

  async loadPage(idParameter: string) {
    const { appUrlSegment, pageUrlSegment } = this
      .constructor as typeof TemplateMgmtBasePageDynamic;

    if (!pageUrlSegment) {
      throw new Error('pageUrlSegment is not defined');
    }

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${idParameter}`);
  }

  static getIdFromUrl(
    fullUrl: string,
    pageSegment: string
  ): string | undefined {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const match = fullUrl.match(new RegExp(`${pageSegment}/([^#/?]+)`));
    const id = match ? match[1] : undefined;
    return id;
  }
}
