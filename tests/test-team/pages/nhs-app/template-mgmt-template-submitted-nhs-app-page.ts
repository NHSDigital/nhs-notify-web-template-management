import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedNhsAppPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageRootUrl = 'nhs-app-template-submitted';

  async loadPage(templateId: string) {
    const { appRootUrl, pageRootUrl } = TemplateMgmtTemplateSubmittedNhsAppPage;

    await this.navigateTo(`/${appRootUrl}/${pageRootUrl}/${templateId}`);
  }
}
