import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtCreateLetterPage extends TemplateMgmtBasePage {
  async loadPage() {
    await this.navigateTo('/templates/create-letter-template');
  }
}
