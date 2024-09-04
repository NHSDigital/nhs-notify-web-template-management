import { Locator, type Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';
import { Session, TemplateType } from '../../../src/utils/types';

export class TemplateMgmtChoosePage extends TemplateMgmtBasePage {
  readonly chooseTemplateRadioGroup: Locator;

  readonly fieldsetHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.chooseTemplateRadioGroup = page.getByRole('radiogroup');
    this.fieldsetHeading = page.locator('[class="nhsuk-fieldset__heading"]');
  }

  static emptySessionData: Session = {
    id: '3d98b0c4-6666-0000-0000-95eb27590000',
    templateType: 'UNKNOWN',
    nhsAppTemplateName: ' ',
    nhsAppTemplateMessage: ' ',
  };

  static emptySessionDataForRadioSelect: Session = {
    id: '3d98b0c4-6666-0000-0000-95eb27590001',
    templateType: 'UNKNOWN',
    nhsAppTemplateName: ' ',
    nhsAppTemplateMessage: ' ',
  };

  static nhsAppRadioSelectedSessionData: Session = {
    id: '3d90000-6666-0000-0000-95eb27590002',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: ' ',
    nhsAppTemplateMessage: ' ',
  };

  static sessionData: Session[] = [
    TemplateMgmtChoosePage.emptySessionData,
    TemplateMgmtChoosePage.emptySessionDataForRadioSelect,
    TemplateMgmtChoosePage.nhsAppRadioSelectedSessionData,
  ];

  static templateOptions = [
    'NHS App message',
    'Email',
    'Text message (SMS)',
    'Letter',
  ];

  private static chooseTemplatePageUrl = `/templates/choose-a-template-type`;

  async navigateToChooseTemplatePage(sessionId: string) {
    await this.navigateTo(
      `${TemplateMgmtChoosePage.chooseTemplatePageUrl}/${sessionId}`
    );
  }

  static async checkRadioButton(templateRadioButton: Locator) {
    await templateRadioButton.check();
  }
}
