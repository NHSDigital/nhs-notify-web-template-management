import { Page } from '@playwright/test';
import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitEmailPage extends TemplateMgmtSubmitBasePage {
  constructor(page: Page) {
    super(page, 'email');
  }
}
