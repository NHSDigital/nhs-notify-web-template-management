import { Page } from '@playwright/test';
import { TemplateMgmtBasePage } from './template-mgmt-base-page';

export class TemplateMgmtRequestADigitalProofPage extends TemplateMgmtBasePage {
  static readonly pathTemplate = '/request-a-proof/:templateId';

  constructor(page: Page) {
    super(page);
  }
}
