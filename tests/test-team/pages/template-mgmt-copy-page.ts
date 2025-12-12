import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCopyPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/copy-template/:templateId';

  readonly radioButtons: Locator;

  readonly learnMoreLink: Locator;

  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.learnMoreLink = page.getByText(
      'Learn more about message channels (opens in a new tab)'
    );

    this.continueButton = page.locator(
      '[id="choose-a-template-type-submit-button"]'
    );
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
