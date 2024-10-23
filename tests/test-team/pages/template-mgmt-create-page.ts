import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCreatePage extends TemplateMgmtBasePage {
  private static createNhsAppTemplatePageUrl =
    '/templates/create-nhs-app-template';

  private static createSmsTemplatePageUrl =
    '/templates/create-text-message-template';

  private static createEmailTemplatePageUrl =
    '/templates/create-email-template';

  async navigateToCreateNhsAppTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createNhsAppTemplatePageUrl}/${sessionId}`
    );
  }

  async navigateToCreateSmsTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createSmsTemplatePageUrl}/${sessionId}`
    );
  }
}
