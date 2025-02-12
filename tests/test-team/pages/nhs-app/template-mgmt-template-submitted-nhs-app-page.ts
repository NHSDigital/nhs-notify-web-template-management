import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedNhsAppPage extends TemplateMgmtTemplateSubmittedBasePage {
  static get pageUrlSegment() {
    return 'nhs-app-template-submitted';
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } =
      TemplateMgmtTemplateSubmittedNhsAppPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
