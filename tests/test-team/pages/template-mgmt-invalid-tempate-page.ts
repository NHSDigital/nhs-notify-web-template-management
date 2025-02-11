import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtInvalidTemplatePage extends TemplateMgmtBasePage {
  static readonly pageRootUrl = 'invalid-template';

  async loadPage() {
    const { appRootUrl, pageRootUrl } = TemplateMgmtInvalidTemplatePage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}`);
  }
}
