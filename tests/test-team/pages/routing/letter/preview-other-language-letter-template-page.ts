import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewOtherLanguageLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-other-language-letter-template/:messagePlanId/preview-template/:templateId';

  constructor(page: Page) {
    super(page);
  }
}
