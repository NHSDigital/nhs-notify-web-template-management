import { Locator, Page } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class TemplateMgmtCreateNhsAppPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'create-nhs-app-template';

  public readonly nameInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly personalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly characterCountText: Locator;

  public readonly goBackLink: Locator;

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
      '[data-testid="how-to-name-your-template"]'
    );
    this.characterCountText = page.locator('[id="character-count"]');
    this.goBackLink = page
      .locator('.nhsuk-back-link__link')
      .and(page.getByText('Back to choose a template type'));
    this.messageFormatting = new TemplateMgmtMessageFormatting(page);
    this.saveAndPreviewButton = page.locator(
      '[id="create-nhs-app-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
