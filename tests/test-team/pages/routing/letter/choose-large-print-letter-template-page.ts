import { type Page } from '@playwright/test';
import { TemplateMgmtChooseTemplateForMessagePlanBasePage } from 'pages/template-mgmt-choose-template-base-page';

export class RoutingChooseLargePrintLetterTemplatePage extends TemplateMgmtChooseTemplateForMessagePlanBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-large-print-letter-template/:messagePlanId';

  constructor(page: Page) {
    super(page);
  }
}
