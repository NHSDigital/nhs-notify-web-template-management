import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedNhsAppPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageUrlSegment = 'nhs-app-template-submitted';

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtTemplateSubmittedNhsAppPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
