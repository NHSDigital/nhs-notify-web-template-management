import { Locator, Page } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePageDynamic } from '../template-mgmt-base-page-dynamic';

export class TemplateMgmtEditSmsPage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment = 'edit-text-message-template';

  public readonly nameInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly customPersonalisationFields: Locator;

  public readonly pdsPersonalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly pricingLink: Locator;

  public readonly characterCountText: Locator;

  public readonly messageFormatting: TemplateMgmtMessageFormatting;

  public readonly saveAndPreviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="smsTemplateName"]');
    this.messageTextArea = page.locator('[id="smsTemplateMessage"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.customPersonalisationFields = page.locator(
      '[data-testid="custom-personalisation-fields-details"]'
    );
    this.pdsPersonalisationFields = page.locator(
      '[data-testid="pds-personalisation-fields-details"]'
    );
    this.namingYourTemplate = page.locator(
      '[data-testid="how-to-name-your-template"]'
    );
    this.pricingLink = page.getByTestId('sms-pricing-info-0').locator('a');
    this.characterCountText = page.getByTestId('character-message-count-0');

    this.messageFormatting = new TemplateMgmtMessageFormatting(page);
    this.saveAndPreviewButton = page.locator(
      '[id="create-sms-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
