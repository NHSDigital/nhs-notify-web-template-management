import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtCopyPage extends TemplateMgmtBasePage {
  static readonly pageUrlSegment = 'copy-template';

  readonly radioButtons: Locator;

  readonly learnMoreLink: Locator;

  readonly goBackLink: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.learnMoreLink = page.getByText(
      'Learn more about message channels (opens in a new tab)'
    );

    this.goBackLink = page
      .locator('.nhsuk-back-link__link')
      .and(page.getByText('Back to all templates'));
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }
}
