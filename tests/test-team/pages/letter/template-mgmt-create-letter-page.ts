import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageNonDynamic } from '../template-mgmt-base-page-non-dynamic';

export class TemplateMgmtCreateLetterPage extends TemplateMgmtBasePageNonDynamic {
  static readonly pageUrlSegment = 'create-letter-template';

  public readonly nameInput: Locator;

  public readonly letterTypeSelect: Locator;

  public readonly languageSelect: Locator;

  public readonly errorSummary: Locator;

  public readonly goBackLink: Locator;

  public readonly saveAndPreviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="letterTemplateName"]');
    this.letterTypeSelect = page.locator('[id="letterTemplateLetterType"]');
    this.languageSelect = page.locator('[id="letterTemplateLetterType"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.goBackLink = page
      .locator('.nhsuk-back-link__link')
      .and(page.getByText('Back to choose a template type'));

    this.saveAndPreviewButton = page.locator(
      '[id="create-letter-template-submit-button"]'
    );
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }
}
