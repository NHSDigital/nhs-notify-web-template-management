import { expect, Locator, Page } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtEditSmsPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/edit-text-message-template/:templateId';

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
    this.namingYourTemplate = page.getByRole('group', {
      name: 'Naming your templates',
    });
    this.pricingLink = page.getByTestId('sms-pricing-info').locator('a');
    this.characterCountText = page.getByTestId('character-message-count');

    this.messageFormatting = new TemplateMgmtMessageFormatting(page);
    this.saveAndPreviewButton = page.locator(
      '[id="create-sms-template-submit-button"]'
    );
  }

  async loadPage() {
    await super.loadPage();
    await this.waitForPageToLoad();
  }

  async waitForPageToLoad() {
    const characterCountLocator = this.page.locator(
      '[data-testid="character-message-count"]'
    );
    await expect(characterCountLocator).toBeVisible();
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }

  async attemptToLoadPageExpectFailure() {
    await super.loadPage();
  }
}
