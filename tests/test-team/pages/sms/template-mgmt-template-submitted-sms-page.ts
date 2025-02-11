import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedSmsPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageUrlRoot = 'text-message-template-submitted';

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtTemplateSubmittedSmsPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
