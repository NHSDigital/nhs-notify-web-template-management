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

  // Method not intended for use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fillForm(input: {
    name: string;
    campaignId: string;
    filePath: string;
    language?: string;
  }) {
    throw new Error(
      'This method is not intended to be called directly and should be overidden from an inherited class.'
    );
  }
}
