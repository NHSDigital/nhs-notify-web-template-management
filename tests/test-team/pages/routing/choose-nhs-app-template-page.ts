import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class ChooseNhsAppTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment = 'message-plans/choose-nhs-app-template';

  constructor(page: Page) {
    super(page);
  }
}
