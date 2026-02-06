import type { Locator, Page } from '@playwright/test';
import type { Channel, LetterType } from 'nhs-notify-backend-client';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingReviewAndMoveToProductionPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/review-and-move-to-production/:messagePlanId';

  public readonly messagePlanName: Locator;

  public readonly previewToggleButton: Locator;

  public readonly detailsSections: Locator;

  public readonly moveToProductionButton: Locator;

  public readonly keepInDraftButton: Locator;

  constructor(page: Page) {
    super(page);

    this.messagePlanName = page.getByTestId('plan-name');
    this.previewToggleButton = page.getByRole('button', {
      name: /^(Open|Close) all template previews$/,
    });
    this.detailsSections = page.locator('details');
    this.moveToProductionButton = page.getByTestId('move-to-production-button');
    this.keepInDraftButton = page.getByTestId('keep-in-draft-link');
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
        const { templateName, templateLink, ...card } = this.getCard(
          conditionalTemplates.getByTestId('conditional-template-languages')
        );

        return {
          ...card,
          templateNames: templateName,
          templateLinks: templateLink,
        };
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
