import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtUploadOtherLanguageLetterTemplatePage extends TemplateMgmtBasePage {
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
}
