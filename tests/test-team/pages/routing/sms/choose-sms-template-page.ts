import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingChooseTextMessageTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = [
    'message-plans/choose-text-message-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
