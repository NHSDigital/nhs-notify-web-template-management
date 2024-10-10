import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCreatePage extends TemplateMgmtBasePage {
  private static createTemplatePageUrl = '/templates/create-nhs-app-template';

  private static createEmailTemplatePageUrl =
    '/templates/create-email-template';

  async navigateToCreateNhsAppTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createTemplatePageUrl}/${sessionId}`
    );
  }

  async navigateToCreatEmailTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createEmailTemplatePageUrl}/${sessionId}`
    );
  }
}
