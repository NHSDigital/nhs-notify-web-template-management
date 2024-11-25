import { chooseTemplatePageContent } from '@content/content';
import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePage {
  readonly radioButtons: Locator;

  readonly learnMoreLink: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.learnMoreLink = page.getByText(chooseTemplatePageContent.learnMoreText);
  }

  async loadPage(_: string) {
    await this.navigateTo('/templates/choose-a-template-type');
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }
}
