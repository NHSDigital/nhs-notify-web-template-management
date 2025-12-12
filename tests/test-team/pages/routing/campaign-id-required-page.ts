import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class RoutingMessagePlanCampaignIdRequiredPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/message-plans/campaign-id-required';

  public readonly errorDetailsInsetText: Locator;
  public readonly heading: Locator;

  constructor(page: Page) {
    super(page);

    this.errorDetailsInsetText = page.locator('[class="nhsuk-inset-text"] > p');
    this.heading = page.getByTestId('page-heading');
  }
}
