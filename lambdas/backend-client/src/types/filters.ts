import {
  GetV1RoutingConfigurationsData,
  GetV1TemplatesData,
} from './generated';

export type TemplateFilter = GetV1TemplatesData['query'];
export type RoutingConfigFilter = GetV1RoutingConfigurationsData['query'];
