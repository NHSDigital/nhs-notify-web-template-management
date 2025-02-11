import { Page } from '@playwright/test';
import { TemplateMgmtSubmitBasePage } from '../template-mgmt-submit-base-page';

export class TemplateMgmtSubmitNhsAppPage extends TemplateMgmtSubmitBasePage {
  constructor(page: Page) {
    super(page, 'nhs-app');
  }
}
