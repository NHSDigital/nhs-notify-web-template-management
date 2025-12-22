import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingPreviewNhsAppTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-nhs-app-template/:messagePlanId/preview-template/:templateId';
}
