import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewLargePrintLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-large-print-letter-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
