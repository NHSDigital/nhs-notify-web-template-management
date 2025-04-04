import { Locator, Page } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePageDynamic } from '../template-mgmt-base-page-dynamic';

export class TemplateMgmtEditEmailPage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegment = 'edit-email-template';

  public readonly nameInput: Locator;

  public readonly subjectLineInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly personalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly messageFormatting: TemplateMgmtMessageFormatting;

  public readonly saveAndPreviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="emailTemplateName"]');
    this.subjectLineInput = page.locator('[id="emailTemplateSubjectLine"]');
    this.messageTextArea = page.locator('[id="emailTemplateMessage"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.personalisationFields = page.locator(
      '[data-testid="personalisation-details"]'
    );
    this.namingYourTemplate = page.locator(
      '[data-testid="how-to-name-your-template"]'
    );

    this.messageFormatting = new TemplateMgmtMessageFormatting(page);

    this.saveAndPreviewButton = page.locator(
      '[id="create-email-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
