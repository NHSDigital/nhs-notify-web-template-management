import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedLetterPage extends TemplateMgmtTemplateSubmittedBasePage {
  static readonly pageUrlSegments = ['letter-template-submitted'];

  public static readonly urlRegexp = new RegExp(
    /\/templates\/letter-template-submitted\/([\dA-Fa-f-]+)$/
  );
}
