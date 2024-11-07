import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCreatePage extends TemplateMgmtBasePage {
  private static createNhsAppTemplatePageUrl =
    '/templates/create-nhs-app-template';

  async loadPage(templateId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createNhsAppTemplatePageUrl}/${templateId}`
    );
  }
}
