import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class ChooseStandardEnglishLetterTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment =
    'message-plans/choose-standard-english-letter-template';

  constructor(page: Page) {
    super(page);
  }
}
