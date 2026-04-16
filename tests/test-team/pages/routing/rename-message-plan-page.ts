import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingRenameMessagePlanPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/rename-message-plan/:messagePlanId';

  readonly submitButton: Locator;

  readonly nameField: Locator;

  readonly nameFieldError: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByTestId('submit-button');
    this.nameField = page.getByTestId('name-field');

    this.nameFieldError = page.locator('#name--error-message');
  }

  async clickSubmit() {
    await this.submitButton.click();
  }
}
