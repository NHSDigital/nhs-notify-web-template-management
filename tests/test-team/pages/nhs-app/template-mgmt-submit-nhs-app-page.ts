import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitNhsAppPage extends TemplateMgmtSubmitBasePage {
  static get pageUrlSegment() {
    return 'submit-nhs-app-template';
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtSubmitNhsAppPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
