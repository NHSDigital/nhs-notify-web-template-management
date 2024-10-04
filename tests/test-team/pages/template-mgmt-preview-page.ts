import { Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtPreviewPage extends TemplateMgmtBasePage {
  readonly placeholder: string;

  constructor(page: Page) {
    super(page);
    this.placeholder = '';
  }
}
