import { type Page } from '@playwright/test';
import { TemplateMgmtChooseTemplateForMessagePlanBasePage } from 'pages/template-mgmt-choose-template-base-page';

export class RoutingChooseLargePrintLetterTemplatePage extends TemplateMgmtChooseTemplateForMessagePlanBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-large-print-letter-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
