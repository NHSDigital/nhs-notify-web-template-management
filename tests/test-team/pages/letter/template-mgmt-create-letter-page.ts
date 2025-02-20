import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class TemplateMgmtCreateLetterPage extends TemplateMgmtBasePageNonDynamic {
  async loadPage() {
    await this.navigateTo('/templates/create-letter-template');
  }
}
