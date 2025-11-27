import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedLetterPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pathTemplate = '/letter-template-submitted/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/letter-template-submitted\/([\dA-Fa-f-]+)$/
  );
}
