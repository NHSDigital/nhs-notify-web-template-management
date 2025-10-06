import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class RoutingChooseMessageOrderPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'choose-message-order';

  readonly radioButtons: Locator;

  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.continueButton = page.locator('button.nhsuk-button[type="submit"]', {
      hasText: 'Save and continue',
    });
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
