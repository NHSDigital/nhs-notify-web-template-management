import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/choose-a-template-type';

  readonly radioButtons: Locator;

  readonly templateTypeRadioButtons: Locator;

  readonly letterTypeRadioButtons: Locator;

  readonly learnMoreLink: Locator;

  readonly continueButton: Locator;

  readonly templateTypeFormError: Locator;

  readonly letterTypeFormError: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.templateTypeRadioButtons = page.locator(
      '#templateType [type="radio"]'
    );
    this.letterTypeRadioButtons = page.locator('#letterType [type="radio"]');
    this.learnMoreLink = page.getByText(
      'Learn more about message channels (opens in a new tab)'
    );
    this.continueButton = page.locator('button.nhsuk-button[type="submit"]', {
      hasText: 'Continue',
    });
    this.templateTypeFormError = page.locator('#templateType--error-message');
    this.letterTypeFormError = page.locator('#letterType--error-message');
  }

  getRadioButton(radioId: string): Locator {
    return this.page.getByRole('radio').getByTestId(`${radioId}-radio`);
  }

  getTemplateTypeRadio(
    templateType: 'nhsapp' | 'email' | 'sms' | 'letter'
  ): Locator {
    return this.getRadioButton(templateType);
  }

  getLetterTypeRadio(letterType: 'x0' | 'x1' | 'q4' | 'language'): Locator {
    return this.getRadioButton(`letter-type-${letterType}`);
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
