import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class RoutingMessagePlansPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'message-plans';

  readonly messagePlanStatusInfo: Locator;

  readonly newMessagePlanButton: Locator;

  readonly draftMessagePlansTable: Locator;

  readonly productionMessagePlansTable: Locator;

  constructor(page: Page) {
    super(page);
    this.messagePlanStatusInfo = page.getByTestId('message-plans-status-info');
    this.newMessagePlanButton = page.getByTestId('create-message-plan-button');
    this.draftMessagePlansTable = page.getByTestId('message-plans-list-draft');
    this.productionMessagePlansTable = page.getByTestId(
      'message-plans-list-production'
    );
  }

  async clickNewMessagePlanButton() {
    await this.newMessagePlanButton.click();
  }
}
