import { type Page } from '@playwright/test';
import { TemplateMgmtChooseTemplateForMessagePlanBasePage } from 'pages/template-mgmt-choose-template-base-page';

export class RoutingChooseTextMessageTemplatePage extends TemplateMgmtChooseTemplateForMessagePlanBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-text-message-template/:messagePlanId';

  constructor(page: Page) {
    super(page);
  }
}
