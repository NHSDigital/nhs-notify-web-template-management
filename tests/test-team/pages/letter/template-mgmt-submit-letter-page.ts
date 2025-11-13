import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitLetterPage extends TemplateMgmtSubmitBasePage {
  static readonly pageUrlSegments = ['submit-letter-template'];

  public static readonly urlRegexp = new RegExp(
    /\/templates\/submit-letter-template\/([\dA-Fa-f-]+)$/
  );
}
