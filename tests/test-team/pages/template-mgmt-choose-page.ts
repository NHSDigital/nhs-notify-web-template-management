import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from './template-mgmt-base-page-non-dynamic';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegments = ['choose-a-template-type'];

  readonly radioButtons: Locator;

  readonly learnMoreLink: Locator;

  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.learnMoreLink = page.getByText(
      'Learn more about message channels (opens in a new tab)'
    );
    this.continueButton = page.locator('button.nhsuk-button[type="submit"]', {
      hasText: 'Continue',
    });
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
