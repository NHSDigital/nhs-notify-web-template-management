import type {
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
import { FrontendSupportedAccessibleFormats } from 'nhs-notify-web-template-management-utils';

export type ChooseChannelTemplateProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  templateList: TemplateDto[];
  cascadeIndex: number;
  accessibleFormat?: FrontendSupportedAccessibleFormats;
  lockNumber: number;
  noTemplatesText: string;
  isCampaignFiltered?: boolean;
};
