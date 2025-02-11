import { Page } from '@playwright/test';
import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitSmsPage extends TemplateMgmtSubmitBasePage {
  constructor(page: Page) {
    super(page, 'text-message');
  }
}
