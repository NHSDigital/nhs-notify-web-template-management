import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingPreviewSmsTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-text-message-template/:messagePlanId/preview-template/:templateId';
}
