import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitNhsAppPage extends TemplateMgmtSubmitBasePage {
  static readonly pageUrlRoot = 'submit-nhs-app-template';

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtSubmitNhsAppPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
