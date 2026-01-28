import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtDeleteErrorPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/delete-template-error/:templateId';

  readonly messagePlanList: Locator;

  constructor(page: Page) {
    super(page);

    this.messagePlanList = page.getByTestId('message-plan-list');
  }
}
