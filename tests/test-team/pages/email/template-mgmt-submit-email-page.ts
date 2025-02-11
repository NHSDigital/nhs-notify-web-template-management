import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitEmailPage extends TemplateMgmtSubmitBasePage {
  static readonly pageUrlRoot = 'submit-email-template';

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtSubmitEmailPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
