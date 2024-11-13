import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class MessageTemplatePage extends TemplateMgmtBasePage {
  private static messageTemplatePageUrl = '/templates/manage-templates';

  // No sessionId needed now, so just navigate to the base URL
  async loadPage(): Promise<void> {
    await this.navigateTo(MessageTemplatePage.messageTemplatePageUrl);
  }
}
