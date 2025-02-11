import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedNhsAppPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageUrlRoot = 'nhs-app-template-submitted';

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } =
      TemplateMgmtTemplateSubmittedNhsAppPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
