import { Locator, Page } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class TemplateMgmtCreateSmsPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'create-text-message-template';

  public readonly nameInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly customPersonalisationFields: Locator;

  public readonly pdsPersonalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly pricingLink: Locator;

  public readonly characterCountText: Locator;

  public readonly goBackLink: Locator;

  public readonly messageFormatting: TemplateMgmtMessageFormatting;

  public readonly saveAndPreviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="smsTemplateName"]');
    this.messageTextArea = page.locator('[id="smsTemplateMessage"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.customPersonalisationFields = page.locator(
      '[data-testid="custom-personalisation-details"]'
    );
    this.pdsPersonalisationFields = page.locator(
      '[data-testid="pds-personalisation-details"]'
    );
    this.namingYourTemplate = page.locator(
      '[data-testid="how-to-name-your-template"]'
    );
    this.pricingLink = page.getByTestId('sms-pricing-info-0').locator('a');
    this.characterCountText = page.getByTestId('character-message-count-0');
    this.goBackLink = page
      .locator('.nhsuk-back-link__link')
      .and(page.getByText('Back to choose a template type'));

    this.messageFormatting = new TemplateMgmtMessageFormatting(page);
    this.saveAndPreviewButton = page.locator(
      '[id="create-sms-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
