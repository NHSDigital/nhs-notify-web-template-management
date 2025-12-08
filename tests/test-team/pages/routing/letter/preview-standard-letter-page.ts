import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewStandardLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-standard-english-letter-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
