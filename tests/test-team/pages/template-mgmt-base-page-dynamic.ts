import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtBasePageDynamic extends TemplateMgmtBasePage {
  static readonly dynamicPage = true;

  constructor(page: Page) {
    super(page);
  }

  async loadPage(...idParameters: string[]) {
    const { appUrlSegment, pageUrlSegments } = this
      .constructor as typeof TemplateMgmtBasePageDynamic;

    if (!pageUrlSegments || pageUrlSegments.length === 0) {
      throw new Error('Invalid pageUrlSegments');
    }

    if (idParameters.length !== pageUrlSegments.length) {
      throw new Error('ID parameters and URL segments mismatch');
    }

    await this.navigateTo(
      `/${appUrlSegment}/${pageUrlSegments
        .map((segment, index) => `${segment}/${idParameters[index]}`)
        .join('/')}`
    );
  }

  getIdFromUrl(segmentIndex: number = 0): string | undefined {
    const { pageUrlSegments } = this
      .constructor as typeof TemplateMgmtBasePageDynamic;

    const match = this.page
      .url()
      // eslint-disable-next-line security/detect-non-literal-regexp
      .match(new RegExp(`${pageUrlSegments[segmentIndex]}/([^#/?]+)`));
    const id = match ? match[1] : undefined;
    return id;
  }
}
