import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedSmsPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageRootUrl = 'text-message-template-submitted';

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtTemplateSubmittedSmsPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
