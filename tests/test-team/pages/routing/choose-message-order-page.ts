import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';
import { MessageOrder } from 'helpers/enum';

export class RoutingChooseMessageOrderPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/message-plans/choose-message-order';

  readonly radioButtons: Locator;

  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.continueButton = page.locator('button.nhsuk-button[type="submit"]', {
      hasText: 'Save and continue',
    });
  }

  getRadioButton(messageOrder: MessageOrder): Locator {
    const testId = messageOrder.toLowerCase().split(',').join('-');
    return this.page.getByTestId(`${testId}-radio`);
  }

  async checkRadioButton(messageOrder: MessageOrder) {
    await this.getRadioButton(messageOrder).check();
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }
}
