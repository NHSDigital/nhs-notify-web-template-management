import type {
  GetV1RoutingConfigurationsData,
  GetV1TemplatesData,
} from 'nhs-notify-web-template-management-types';

export type TemplateFilter = GetV1TemplatesData['query'];
export type RoutingConfigFilter = GetV1RoutingConfigurationsData['query'];
