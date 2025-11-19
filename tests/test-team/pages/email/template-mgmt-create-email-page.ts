import { Locator, Page } from '@playwright/test';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtCreateEmailPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/create-email-template';

  public readonly nameInput: Locator;

  public readonly subjectLineInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly customPersonalisationFields: Locator;

  public readonly pdsPersonalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly goBackLink: Locator;

  public readonly messageFormatting: TemplateMgmtMessageFormatting;

  public readonly saveAndPreviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="emailTemplateName"]');
    this.subjectLineInput = page.locator('[id="emailTemplateSubjectLine"]');
    this.messageTextArea = page.locator('[id="emailTemplateMessage"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.customPersonalisationFields = page.locator(
      '[data-testid="custom-personalisation-fields-details"]'
    );
    this.pdsPersonalisationFields = page.locator(
      '[data-testid="pds-personalisation-fields-details"]'
    );
    this.namingYourTemplate = page.locator(
      '[data-testid="how-to-name-your-template-details"]'
    );
    this.goBackLink = page
      .locator('.nhsuk-back-link')
      .and(page.getByText('Back to choose a template type'));

    this.messageFormatting = new TemplateMgmtMessageFormatting(page);

    this.saveAndPreviewButton = page.locator(
      '[id="create-email-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
