import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class RoutingChooseMessageOrderPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegments = ['message-plans/choose-message-order'];

  readonly radioButtons: Locator;

  readonly continueButton: Locator;

  readonly goBackLink: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.continueButton = page.locator('button.nhsuk-button[type="submit"]', {
      hasText: 'Save and continue',
    });
    this.goBackLink = page.getByText('Go back');
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel, { exact: true }).check();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
