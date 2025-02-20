import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class TemplateMgmtCreateLetterPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'create-letter-template';

  async loadPage() {
    await this.navigateTo('/templates/create-letter-template');
  }
}
