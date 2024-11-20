import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePage {
  readonly radioButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
  }

  async loadPage(_: string) {
    await this.navigateTo('/templates/choose-a-template-type');
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }
}
