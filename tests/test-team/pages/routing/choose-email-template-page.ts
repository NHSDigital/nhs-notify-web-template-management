import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class ChooseEmailTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment = 'message-plans/choose-email-template';

  constructor(page: Page) {
    super(page);
  }
}
