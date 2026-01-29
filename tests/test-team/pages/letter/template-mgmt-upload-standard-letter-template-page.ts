import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtUploadStandardLetterTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/upload-standard-english-letter-template';

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
}
