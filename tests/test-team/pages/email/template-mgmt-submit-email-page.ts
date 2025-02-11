import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitEmailPage extends TemplateMgmtSubmitBasePage {
  static readonly pageRootUrl = 'submit-email-template';

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtSubmitEmailPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
