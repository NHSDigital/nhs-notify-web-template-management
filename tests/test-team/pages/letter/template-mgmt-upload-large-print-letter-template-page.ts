import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtUploadLetterBasePage } from './template-mgmt-upload-letter-base-page';

export class TemplateMgmtUploadLargePrintLetterTemplatePage extends TemplateMgmtUploadLetterBasePage {
  static readonly pathTemplate = '/upload-large-print-letter-template';

  nameInput: Locator;

  campaignIdInput: Locator;

  singleCampaignIdText: Locator;

  fileInput: Locator;

  submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByLabel('Template name');

    this.campaignIdInput = page.getByLabel('Campaign');

    this.fileInput = page.getByLabel('Template file');

    this.singleCampaignIdText = page.getByTestId('single-campaign-id-text');

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
  }
}
