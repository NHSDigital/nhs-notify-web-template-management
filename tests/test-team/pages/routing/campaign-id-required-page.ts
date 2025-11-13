import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class RoutingMessagePlanCampaignIdRequiredPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegments = ['message-plans/campaign-id-required'];

  public readonly errorDetailsInsetText: Locator;
  public readonly goBackLink: Locator;
  public readonly heading: Locator;

  constructor(page: Page) {
    super(page);

    this.errorDetailsInsetText = page.locator('[class="nhsuk-inset-text"] > p');
    this.goBackLink = page.getByTestId('back-link');
    this.heading = page.getByTestId('page-heading');
  }
}
