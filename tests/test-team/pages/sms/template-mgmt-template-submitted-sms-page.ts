import { Page } from '@playwright/test';
import { TemplateMgmtTemplateSubmittedBasePage } from '../template-mgmt-template-submitted-base-page';

export class TemplateMgmtTemplateSubmittedSmsPage extends TemplateMgmtTemplateSubmittedBasePage {
  constructor(page: Page) {
    super(page, 'text-message');
  }
}
