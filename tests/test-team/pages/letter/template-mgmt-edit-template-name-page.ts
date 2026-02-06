import type { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtEditTemplateNamePage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/edit-template-name/:templateId';

  nameInput: Locator;

  submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByLabel('Edit template name');

    this.submitButton = page.getByRole('button', { name: 'Save changes' });
  }
}
