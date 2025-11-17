import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitLetterPage extends TemplateMgmtSubmitBasePage {
  static readonly pageUrlSegment = 'submit-letter-template';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/submit-letter-template\/([\dA-Fa-f-]+)\?lockNumber=\d+$/
  );

  public static url(id: string, lockNumber: number) {
    return `/templates/${this.pageUrlSegment}/${id}?lockNumber=${lockNumber}`;
  }
}
