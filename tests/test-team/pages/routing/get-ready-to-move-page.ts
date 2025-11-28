import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingGetReadyToMovePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = ['message-plans/get-ready-to-move'];

  public readonly continueLink: Locator;

  public readonly cancelLink: Locator;

  constructor(page: Page) {
    super(page);

    this.continueLink = page.getByTestId('continue-link');
    this.cancelLink = page.getByTestId('cancel-link');
  }
}
