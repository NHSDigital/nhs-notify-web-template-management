import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtUploadLetterBasePage } from './template-mgmt-upload-letter-base-page';

export class TemplateMgmtUploadOtherLanguageLetterTemplatePage extends TemplateMgmtUploadLetterBasePage {
  static readonly pathTemplate = '/upload-other-language-letter-template';

  nameInput: Locator;

  campaignIdInput: Locator;

  singleCampaignIdText: Locator;

  languageInput: Locator;

  fileInput: Locator;

  submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByLabel('Template name');

    this.campaignIdInput = page.getByLabel('Campaign');

    this.singleCampaignIdText = page.getByTestId('single-campaign-id-text');

    this.languageInput = page.getByLabel('Template language');

    this.fileInput = page.getByLabel('Template file');

    this.submitButton = page.getByRole('button', {
      name: 'Upload letter template file',
    });
  }

  async fillForm(input: {
    name: string;
    campaignId: string;
    filePath: string;
    language?: string;
  }) {
    await this.nameInput.fill(input.name);

    await this.campaignIdInput.selectOption(input.campaignId);

    await this.fileInput.click();
    await this.fileInput.setInputFiles(input.filePath);

    if (!input.language) {
      return;
    }

    await this.languageInput.selectOption(input.language);
  }
}
