import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingPreviewMessagePlanPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/preview-message-plan/:messagePlanId';

  copyLink: Locator;

  constructor(page: Page) {
    super(page);

    this.copyLink = page.getByRole('link', {
      name: 'Copy this message plan into draft',
    });
  }
}
