import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtBasePageDynamic extends TemplateMgmtBasePage {
  async loadPage(
    idParameter?: string,
    searchParameters?: Record<string, string>
  ) {
    const { appUrlSegment, pageUrlSegment } = this
      .constructor as typeof TemplateMgmtBasePageDynamic;

    if (!pageUrlSegment) {
      throw new Error('pageUrlSegment is not defined');
    }

    let url = `/${appUrlSegment}/${pageUrlSegment}/${idParameter}`;

    if (searchParameters && Object.keys(searchParameters).length > 0) {
      url += `?${new URLSearchParams(searchParameters).toString()}`;
    }

    await this.navigateTo(url);
  }

  getIdFromUrl(): string | undefined {
    const { pageUrlSegment } = this
      .constructor as typeof TemplateMgmtBasePageDynamic;

    const match = this.page
      .url()
      // eslint-disable-next-line security/detect-non-literal-regexp
      .match(new RegExp(`${pageUrlSegment}/([^#/?]+)`));
    const id = match ? match[1] : undefined;
    return id;
  }

  async attemptToLoadPageExpectFailure(idParameter: string) {
    await this.loadPage(idParameter);
  }
}
