import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

export class RoutingPreviewNhsAppTemplatePage extends TemplateMgmtBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-nhs-app-template/:messagePlanId/preview-template/:templateId';
}
