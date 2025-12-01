import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingChooseEmailTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-email-template/:messagePlanId';

  constructor(page: Page) {
    super(page);
  }
}
