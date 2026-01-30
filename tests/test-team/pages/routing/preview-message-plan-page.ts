import type { Locator, Page } from '@playwright/test';
import type { Channel, LetterType } from 'nhs-notify-backend-client';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingPreviewMessagePlanPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/preview-message-plan/:messagePlanId';

  messagePlanId: Locator;

  campaignId: Locator;

  status: Locator;

  previewToggleButton: Locator;

  detailsSections: Locator;

  constructor(page: Page) {
    super(page);

    this.messagePlanId = page.getByTestId('plan-id');
    this.campaignId = page.getByTestId('campaign-id');
    this.status = page.getByTestId('status');
    this.previewToggleButton = page.getByRole('button', {
      name: /^(Open|Close) all template previews$/,
    });
    this.detailsSections = page.locator('details');
  }

  getTemplateBlock(channel: Channel) {
    const block = this.page.getByTestId(`message-plan-block-${channel}`);

    const defaultTemplateCard = this.getCard(block);

    const conditionalTemplates = block.getByTestId('conditional-templates');

    return {
      locator: block,
      number: block.locator('[class*=message-plan-block-number]'),
      defaultTemplateCard,
      getAccessibilityFormatCard: (format: LetterType) => {
        return this.getCard(
          conditionalTemplates.getByTestId(`conditional-template-${format}`)
        );
      },
      getLanguagesCard: () => {
        return this.getCard(
          conditionalTemplates.getByTestId('conditional-template-languages')
        );
      },
    };
  }

  getFallbackBlock(channel: Channel) {
    return this.page.getByTestId(`message-plan-fallback-conditions-${channel}`);
  }

  private getCard(templateBlock: Locator) {
    const card = templateBlock.getByTestId('channel-card').first();

    return {
      locator: card,
      templateName: card.getByTestId('template-name'),
      previewTemplateSummary: card.getByTestId('preview-template-summary'),
      previewTemplateText: card.getByTestId('preview-template-text'),
      templateLink: card.getByRole('link'),
    };
  }
}
