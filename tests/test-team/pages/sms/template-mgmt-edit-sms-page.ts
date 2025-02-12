import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';

export class TemplateMgmtEditSmsPage extends TemplateMgmtBasePage {
  public readonly nameInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly personalisationFields: Locator;

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
    this.personalisationFields = page.locator(
      '[data-testid="personalisation-details"]'
    );
    this.namingYourTemplate = page.locator(
      '[data-testid="how-to-name-your-template"]'
    );
    this.pricingLink = page.locator('[data-testid="sms-pricing-link"]');
    this.characterCountText = page.locator('[id="character-count"]');

    this.messageFormatting = new TemplateMgmtMessageFormatting(page);
    this.saveAndPreviewButton = page.locator(
      '[id="create-sms-template-submit-button"]'
    );
  }

  async loadPage(templateId: string) {
    await this.navigateTo(
      `/templates/edit-text-message-template/${templateId}`
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
