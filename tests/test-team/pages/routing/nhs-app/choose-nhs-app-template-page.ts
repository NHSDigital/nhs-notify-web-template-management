import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingChooseNhsAppTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = ['message-plans/choose-nhs-app-template'];

  constructor(page: Page) {
    super(page);
  }
}
