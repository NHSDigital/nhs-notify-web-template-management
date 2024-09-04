import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePage {
  readonly chooseTemplateRadioGroup: Locator;

  readonly fieldsetHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.chooseTemplateRadioGroup = page.getByRole('radiogroup');
    this.fieldsetHeading = page.locator('[class="nhsuk-fieldset__heading"]');
  }

  static readonly templateOptions = [
    'NHS App message',
    'Email',
    'Text message (SMS)',
    'Letter',
  ];

  private static readonly chooseTemplatePageUrl = `/templates/choose-a-template-type`;

  async navigateToChooseTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtChoosePage.chooseTemplatePageUrl}/${sessionId}`
    );
  }

  static async checkRadioButton(templateRadioButton: Locator) {
    await templateRadioButton.check();
  }
}
