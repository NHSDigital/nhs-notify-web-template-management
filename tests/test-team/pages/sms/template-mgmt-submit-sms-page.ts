import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitSmsPage extends TemplateMgmtSubmitBasePage {
  static readonly pageRootUrl = 'submit-text-message-template';

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtSubmitSmsPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
