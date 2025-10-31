import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingMoveToProductionPage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment = 'message-plans/move-to-production';

  public readonly previewLink: Locator;

  public readonly submitButton: Locator;

  public readonly cancelLink: Locator;

  constructor(page: Page) {
    super(page);

    this.previewLink = page.getByTestId('preview-link');
    this.submitButton = page.getByTestId('submit-button');
    this.cancelLink = page.getByTestId('cancel-link');
  }
}
