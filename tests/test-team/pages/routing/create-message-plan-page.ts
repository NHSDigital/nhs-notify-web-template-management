import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class CreateMessagePlanPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'message-plans/create-message-plan';

  readonly submitButton: Locator;

  readonly goBackLink: Locator;

  readonly nameField: Locator;

  readonly nameFieldError: Locator;

  readonly campaignIdSelector: Locator;

  readonly campaignIdFieldError: Locator;

  readonly singleCampaignIdElement: Locator;

  constructor(page: Page, queryParameters?: { messageOrder: string }) {
    super(page);
    this.submitButton = page.locator('button.nhsuk-button[type="submit"]', {
      hasText: 'Save and continue',
    });
    this.goBackLink = page.getByText('Go back');
    this.nameField = page.getByTestId('name-field');
    this.campaignIdSelector = page.getByTestId('campaign-id-field');
    this.singleCampaignIdElement = page.getByTestId('single-campaign-id');

    if (queryParameters) {
      this.queryParameters = new URLSearchParams(queryParameters);
    }

    this.nameFieldError = page.locator('#name--error-message');

    this.campaignIdFieldError = page.locator('#campaignId--error-message');
  }

  async clickSubmit() {
    await this.submitButton.click();
  }
}
