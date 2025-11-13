import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingPreviewStandardLetterTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = [
    'message-plans/choose-standard-english-letter-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
