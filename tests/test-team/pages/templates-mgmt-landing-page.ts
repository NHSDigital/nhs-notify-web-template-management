import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtLandingPage extends TemplateMgmtBasePage {
  static readonly pageUrlSegment = 'create-and-submit-templates';

  async loadPage() {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtLandingPage;

    await this.page.goto(`/${appUrlSegment}/${pageUrlSegment}`);
    await super.clickSignInLink();
  }
}
