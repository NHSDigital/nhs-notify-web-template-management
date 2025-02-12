import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtInvalidTemplatePage extends TemplateMgmtBasePage {
  get pageUrlSegment() { return 'invalid-template';}

  async loadPage() {
    const { appUrlSegment, pageUrlSegment } = TemplateMgmtInvalidTemplatePage;

    await this.navigateTo(`/${appUrlSegment}/${pageUrlSegment}`);
  }
}
