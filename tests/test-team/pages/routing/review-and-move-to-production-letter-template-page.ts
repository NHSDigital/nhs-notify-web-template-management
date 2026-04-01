import { TemplateMgmtPreviewBasePage } from 'pages/template-mgmt-preview-base-page';

export class RoutingReviewAndMoveToProductionLetterTemplatePage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate =
    '/message-plans/review-and-move-to-production/:messagePlanId/preview-template/:templateId';
}
