import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewMessagePlanPreviewLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate =
    '/message-plans/preview-message-plan/:messagePlanId/preview-template/:templateId';

  public readonly letterPreviewHeading: Locator;
  public readonly letterPreviewIframe: Locator;

  constructor(page: Page) {
    super(page);
    this.letterPreviewHeading = page.getByRole('heading', {
      name: 'Example preview',
    });
    this.letterPreviewIframe = page.locator('iframe[title="Letter preview"]');
  }
}
