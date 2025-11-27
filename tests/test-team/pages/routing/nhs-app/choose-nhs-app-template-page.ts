import { type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingChooseNhsAppTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-nhs-app-template/:messagePlanId';

  constructor(page: Page) {
    super(page);
  }
}
