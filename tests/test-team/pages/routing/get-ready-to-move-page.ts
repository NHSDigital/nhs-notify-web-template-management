import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingGetReadyToMovePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/get-ready-to-move/:messagePlanId';

  public readonly continueLink: Locator;

  public readonly cancelLink: Locator;

  constructor(page: Page) {
    super(page);

    this.continueLink = page.getByTestId('continue-link');
    this.cancelLink = page.getByTestId('cancel-link');
  }
}
