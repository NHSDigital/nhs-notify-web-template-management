import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedEmailPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageUrlSegment = 'email-template-submitted';

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtTemplateSubmittedEmailPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
