import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class RoutingCreateMessagePlanPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/message-plans/create-message-plan';

  readonly submitButton: Locator;

  readonly nameField: Locator;

  readonly nameFieldError: Locator;

  readonly campaignIdSelector: Locator;

  readonly campaignIdFieldError: Locator;

  readonly singleCampaignIdElement: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByTestId('submit-button');
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
