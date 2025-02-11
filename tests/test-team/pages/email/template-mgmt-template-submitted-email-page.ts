import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedEmailPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageUrlRoot = 'email-template-submitted';

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } =
      TemplateMgmtTemplateSubmittedEmailPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
