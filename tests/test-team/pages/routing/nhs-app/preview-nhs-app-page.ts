import { type Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';

export class RoutingPreviewNhsAppTemplatePage extends TemplateMgmtBasePageDynamic {
  static readonly pageUrlSegments = [
    'message-plans/choose-nhs-app-template',
    'preview-template',
  ];

  constructor(page: Page) {
    super(page);
  }
}
