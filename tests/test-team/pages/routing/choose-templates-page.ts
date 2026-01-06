import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingChooseTemplatesPage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-templates/:messagePlanId';

  public readonly errorSummary: Locator;

  public readonly editSettingsLink: Locator;

  public readonly routingConfigId: Locator;

  public readonly campaignId: Locator;

  public readonly messagePlanStatus: Locator;

  public readonly channelBlocks: Locator;

  public readonly moveToProductionButton: Locator;

  public readonly saveAndCloseButton: Locator;

  public readonly conditionalLetterTemplates: Locator;

  constructor(page: Page) {
    super(page);
    this.errorSummary = page.locator('.nhsuk-error-summary');
    this.editSettingsLink = page.getByTestId('edit-settings-link');
    this.routingConfigId = page.getByTestId('routing-config-id');
    this.campaignId = page.getByTestId('campaign-id');
    this.messagePlanStatus = page.locator('strong.nhsuk-tag');
    this.channelBlocks = page.locator('[data-testid^="message-plan-block-"]');
    this.moveToProductionButton = page.getByTestId('move-to-production-cta');
    this.saveAndCloseButton = page.getByTestId('save-and-close-cta');
    this.conditionalLetterTemplates = page.getByTestId(
      'message-plan-conditional-templates'
    );
  }

  public messagePlanItem(identifier: string) {
    return {
      templateItem: this.page.getByTestId(`channel-template-${identifier}`),
      heading: this.page
        .getByTestId(`channel-template-${identifier}`)
        .getByRole('heading', { level: 3 }),
      templateName: this.page
        .getByTestId(`template-name-${identifier}`)
        .first(),
      templateNames: this.page.getByTestId(`template-name-${identifier}`),
      changeTemplateLink: this.page.getByTestId(
        `change-template-link-${identifier}`
      ),
      chooseTemplateLink: this.page.getByTestId(
        `choose-template-link-${identifier}`
      ),
      removeTemplateLink: this.page.getByTestId(
        `remove-template-link-${identifier}`
      ),
      async clickChooseTemplateLink() {
        await this.chooseTemplateLink.click();
      },
      async clickChangeTemplateLink() {
        await this.changeTemplateLink.click();
      },
      async clickRemoveTemplateLink() {
        await this.removeTemplateLink.click();
      },
    };
  }

  public messagePlanChannel(channel: string) {
    return {
      ...this.messagePlanItem(channel),
      block: this.page.getByTestId(`message-plan-block-${channel}`),
      number: this.page
        .getByTestId(`message-plan-block-${channel}`)
        .locator('[class*=message-plan-block-number]'),
      fallbackConditions: this.page.getByTestId(
        `message-plan-fallback-conditions-${channel}`
      ),
    };
  }

  public readonly nhsApp = this.messagePlanChannel('NHSAPP');

  public readonly sms = this.messagePlanChannel('SMS');

  public readonly email = this.messagePlanChannel('EMAIL');

  public readonly letter = this.messagePlanChannel('LETTER');

  public alternativeLetterFormats() {
    const conditionalTemplates = this.page.getByTestId(
      'message-plan-conditional-templates'
    );
    return {
      conditionalTemplates,
      fallbackConditions: conditionalTemplates.getByTestId(
        'message-plan-fallback-conditions-LETTER'
      ),
      listItems: conditionalTemplates.locator(
        '[class*=message-plan-conditional-templates__list-item]'
      ),
      largePrint: this.messagePlanItem('x1'),
      otherLanguages: this.messagePlanItem('foreign-language'),
    };
  }

  async clickMoveToProduction() {
    await this.moveToProductionButton.click();
  }

  async clickSaveAndClose() {
    await this.saveAndCloseButton.click();
  }
}
