import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class RoutingCreateMessagePlanPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'message-plans/create-message-plan';

  readonly submitButton: Locator;

  readonly goBackLink: Locator;

  readonly nameField: Locator;

  readonly nameFieldError: Locator;

  readonly campaignIdSelector: Locator;

  readonly campaignIdFieldError: Locator;

  readonly singleCampaignIdElement: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByTestId('submit-button');
    this.goBackLink = page.getByTestId('go-back-link');
    this.nameField = page.getByTestId('name-field');
    this.campaignIdSelector = page.getByTestId('campaign-id-field');
    this.singleCampaignIdElement = page.getByTestId('single-campaign-id');

    this.nameFieldError = page.locator('#name--error-message');

    this.campaignIdFieldError = page.locator('#campaignId--error-message');
  }

  async clickSubmit() {
    await this.submitButton.click();
  }
}
