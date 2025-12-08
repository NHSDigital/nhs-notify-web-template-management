import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewEmailTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-email-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
