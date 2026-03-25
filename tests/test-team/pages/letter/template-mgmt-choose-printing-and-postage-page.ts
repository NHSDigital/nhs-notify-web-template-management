import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtChoosePrintingAndPostagePage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/choose-printing-and-postage/:templateId';

  variantsTable: Locator;

  submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.variantsTable = page.getByRole('table');

    this.submitButton = page.getByRole('button', {
      name: 'Save and continue',
    });
  }

  getRadioInput(variantName: string): Locator {
    return this.page.getByLabel(variantName);
  }

  async selectVariant(variantName: string) {
    await this.getRadioInput(variantName).check();
  }

  async clickSubmit() {
    await this.submitButton.click();
  }
}
