import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export abstract class TemplateMgmtBasePageNonDynamic extends TemplateMgmtBasePage {
  async loadPage(searchParameters?: Record<string, string>) {
    const { appUrlSegment, pageUrlSegment } = this
      .constructor as typeof TemplateMgmtBasePageNonDynamic;

    if (!pageUrlSegment) {
      throw new Error('pageUrlSegment is not defined');
    }

    let url = `/${appUrlSegment}/${pageUrlSegment}`;

    if (searchParameters && Object.keys(searchParameters).length > 0) {
      url += `?${new URLSearchParams(searchParameters).toString()}`;
    }

    await this.navigateTo(url);
  }

  async attemptToLoadPageExpectFailure() {
    await this.loadPage();
  }
}
