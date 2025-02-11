import { Page } from '@playwright/test';
import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedNhsAppPage extends TemplateMgmtTemplateSubmittedBasePage {
  constructor(page: Page) {
    super(page, 'nhs-app');
  }
}
