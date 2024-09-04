// import { type Page } from '@playwright/test';
import { Session, TemplateType } from '@utils/types';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCreatePage extends TemplateMgmtBasePage {
  // constructor(page: Page) {
  //   super(page);
  // }

  static nhsAppNoTemplateSessionData: Session = {
    id: '3d98b0c4-6666-0000-1111-95eb27590000',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: ' ',
    nhsAppTemplateMessage: ' ',
  };

  static sessionData: Session[] = [
    TemplateMgmtCreatePage.nhsAppNoTemplateSessionData,
  ];

  private static createTemplatePageUrl = '/templates/create-nhs-app-template';

  async navigateToCreateNhsAppTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtCreatePage.createTemplatePageUrl}/${sessionId}`
    );
  }
}
