import type { Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewSmsTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-text-message-template/:messagePlanId/preview-template/:templateId';

  constructor(page: Page) {
    super(page);
  }
}
