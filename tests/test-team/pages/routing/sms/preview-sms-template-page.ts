import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewSmsTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-text-message-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
