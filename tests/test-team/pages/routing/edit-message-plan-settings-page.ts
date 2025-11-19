import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingEditMessagePlanSettingsPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/edit-message-plan-settings/:messagePlanId';

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
