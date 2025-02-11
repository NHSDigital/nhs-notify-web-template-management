import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedEmailPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageRootUrl = 'email-template-submitted';

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtTemplateSubmittedEmailPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
