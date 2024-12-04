import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class ManageTemplatesPage extends TemplateMgmtBasePage {
  private static manageTemplatesPageUrl = '/templates/manage-templates';

  // No sessionId needed now, so just navigate to the base URL
  async loadPage(): Promise<void> {
    await this.navigateTo(ManageTemplatesPage.manageTemplatesPageUrl);
  }
}
