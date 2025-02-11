import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitSmsPage extends TemplateMgmtSubmitBasePage {
  static readonly pageUrlRoot = 'submit-text-message-template';

  async loadPage(templateId: string) {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtSubmitSmsPage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}/${templateId}`);
  }
}
