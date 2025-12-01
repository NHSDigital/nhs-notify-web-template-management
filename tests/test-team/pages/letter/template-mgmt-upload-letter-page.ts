import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtUploadLetterPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/upload-letter-template';

  public readonly nameInput: Locator;

  public readonly letterTypeSelect: Locator;

  public readonly languageSelect: Locator;

  public readonly errorSummary: Locator;

  public readonly goBackLink: Locator;

  public readonly saveAndPreviewButton: Locator;

  public readonly pdfSelector: Locator;

  public readonly csvSelector: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="letterTemplateName"]');
    this.letterTypeSelect = page.locator('[id="letterTemplateLetterType"]');
    this.languageSelect = page.locator('[id="letterTemplateLetterType"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.goBackLink = page
      .locator('.nhsuk-back-link')
      .and(page.getByText('Back to choose a template type'));

    this.saveAndPreviewButton = page.locator(
      '[id="upload-letter-template-submit-button"]'
    );

    this.pdfSelector = page.locator('input[name="letterTemplatePdf"]');
    this.csvSelector = page.locator('input[name="letterTemplateCsv"]');
  }

  async clickSaveAndPreviewButton() {
    await this.saveAndPreviewButton.click();
  }

  async setPdfFile(path: string) {
    await TemplateMgmtUploadLetterPage.setFileField(this.pdfSelector, path);
  }

  async setCsvFile(path: string) {
    await TemplateMgmtUploadLetterPage.setFileField(this.csvSelector, path);
  }

  private static async setFileField(field: Locator, path: string) {
    await field.click();
    await field.setInputFiles(path);
  }
}
