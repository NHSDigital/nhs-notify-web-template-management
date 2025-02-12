import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedSmsPage extends TemplateMgmtTemplateSubmittedBasePage {
  static get pageUrlSegment() {
    return 'text-message-template-submitted';
  }

  async loadPage(templateId: string) {
    const { appUrlSegment, pageUrlSegment } =
      TemplateMgmtTemplateSubmittedSmsPage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}/${templateId}`);
  }
}
