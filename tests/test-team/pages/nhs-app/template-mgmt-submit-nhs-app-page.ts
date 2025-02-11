import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitNhsAppPage extends TemplateMgmtSubmitBasePage {
  static readonly pageRootUrl = 'submit-nhs-app-template';

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtSubmitNhsAppPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
