import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingPreviewEmailTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-email-template/:messagePlanId/preview-template/:templateId';
}
