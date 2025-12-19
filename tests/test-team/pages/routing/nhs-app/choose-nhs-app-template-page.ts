import { type Page } from '@playwright/test';
import { TemplateMgmtChooseTemplateForMessagePlanBasePage } from 'pages/template-mgmt-choose-template-base-page';

export class RoutingChooseNhsAppTemplatePage extends TemplateMgmtChooseTemplateForMessagePlanBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-nhs-app-template/:messagePlanId';
}
