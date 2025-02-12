import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitSmsPage extends TemplateMgmtSubmitBasePage {
  static readonly pageUrlSegment = 'submit-text-message-template';

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtSubmitSmsPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
