import { Locator, Page, expect } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtEditNhsAppPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/edit-nhs-app-template/:templateId';

  public readonly nameInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly personalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly characterCountText: Locator;

  public readonly messageFormatting: TemplateMgmtMessageFormatting;

  public readonly saveAndPreviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="nhsAppTemplateName"]');
    this.messageTextArea = page.locator('[id="nhsAppTemplateMessage"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.personalisationFields = page.locator(
      '[data-testid="personalisation-details"]'
    );
    this.namingYourTemplate = page.locator(
      '[data-testid="how-to-name-your-template-details"]'
    );
    this.characterCountText = page.getByTestId('character-message-count-0');
    this.messageFormatting = new TemplateMgmtMessageFormatting(page);

    this.saveAndPreviewButton = page.locator(
      '[id="create-nhs-app-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }

  async waitForPageToLoad() {
    const characterCountLocator = this.page.getByTestId('character-count-0');
    await expect(characterCountLocator).toBeVisible();
  }

  async loadPage() {
    await super.loadPage();
    await this.waitForPageToLoad();
  }

  async attemptToLoadPageExpectFailure() {
    await super.loadPage();
  }
}
