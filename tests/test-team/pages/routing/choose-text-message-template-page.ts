import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class ChooseTextMessageTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment = 'message-plans/choose-text-message-template';

  constructor(page: Page) {
    super(page);
  }
}
