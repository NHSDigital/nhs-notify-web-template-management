import { type Page } from '@playwright/test';
import { TemplateMgmtChooseTemplateForMessagePlanBasePage } from 'pages/template-mgmt-choose-template-base-page';

export class RoutingChooseTextMessageTemplatePage extends TemplateMgmtChooseTemplateForMessagePlanBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-text-message-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
