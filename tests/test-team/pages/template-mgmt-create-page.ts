import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCreatePage extends TemplateMgmtBasePage {
  private static createTemplatePageUrl = '/templates/create-nhs-app-template';

  async navigateToCreateNhsAppTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createTemplatePageUrl}/${sessionId}`
    );
  }
}
