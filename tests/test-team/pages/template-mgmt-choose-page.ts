import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePage {
  static readonly pageUrlRoot = 'choose-a-template-type';

  readonly radioButtons: Locator;

  readonly learnMoreLink: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.getByRole('radio');
    this.learnMoreLink = page.getByText(
      'Learn more about message channels (opens in a new tab)'
    );
  }

  async loadPage() {
    const { appRootUrl, pageUrlRoot } = TemplateMgmtChoosePage;

    await this.navigateTo(`/${appRootUrl}/${pageUrlRoot}`);
  }

  async checkRadioButton(radioButtonLabel: string) {
    await this.page.getByLabel(radioButtonLabel).check();
  }
}
