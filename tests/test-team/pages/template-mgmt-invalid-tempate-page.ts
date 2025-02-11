import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtInvalidTemplatePage extends TemplateMgmtBasePage {
  static readonly pageUrlRoot = 'invalid-template';

  async loadPage() {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtInvalidTemplatePage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}`);
  }
}
