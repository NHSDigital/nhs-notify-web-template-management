import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';
import { TemplateMgmtMessageFormatting } from '../template-mgmt-message-formatting';

export class TemplateMgmtCreateNhsAppPage extends TemplateMgmtBasePage {
  public readonly nameInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  public readonly personalisationFields: Locator;

  public readonly namingYourTemplate: Locator;

  public readonly characterCountText: Locator;

  public readonly messageFormatting: TemplateMgmtMessageFormatting;

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
    this.messageFormatting = new TemplateMgmtMessageFormatting(page);
  }

  async loadPage(templateId: string) {
    await this.navigateTo(
      templateId
        ? `/templates/edit-nhs-app-template/${templateId}`
        : '/templates/create-nhs-app-template'
    );
  }
}
