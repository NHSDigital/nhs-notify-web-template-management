import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitLetterPage extends TemplateMgmtSubmitBasePage {
  static readonly pathTemplate = '/submit-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/submit-letter-template\/([\dA-Fa-f-]+)\?lockNumber=\d+$/
  );
}
