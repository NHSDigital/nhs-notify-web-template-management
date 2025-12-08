import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewOtherLanguageLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-other-language-letter-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
