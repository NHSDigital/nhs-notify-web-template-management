import { type Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewStandardLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-standard-english-letter-template/:messagePlanId/preview-template/:templateId';

  constructor(page: Page) {
    super(page);
  }
}
