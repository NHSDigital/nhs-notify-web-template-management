import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class TemplateMgmtUploadLetterBasePage extends TemplateMgmtBasePage {
  submitButton: Locator;

  constructor(page: Page) {
    super(page);

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
    throw new Error('This method should be overridden');
  }
}
