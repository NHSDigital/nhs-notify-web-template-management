import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingChooseEmailTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = ['message-plans/choose-email-template'];

  constructor(page: Page) {
    super(page);
  }
}
