import { Locator, Page } from '@playwright/test';
import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtLetterTemplateApprovedPage extends TemplateMgmtSubmitBasePage {
  static readonly pathTemplate = '/letter-template-approved/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/letter-template-approved\/[\dA-Fa-f-]+$/
  );

  public readonly templateName: Locator;

  constructor(page: Page) {
    super(page);
    this.templateName = page.getByTestId('template-name');
  }
}
