import { type Page } from '@playwright/test';
import { TemplateMgmtChooseTemplateForMessagePlanBasePage } from 'pages/template-mgmt-choose-template-base-page';

export class RoutingChooseStandardLetterTemplatePage extends TemplateMgmtChooseTemplateForMessagePlanBasePage {
  static readonly pageUrlSegments = [
    'message-plans/choose-standard-english-letter-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
