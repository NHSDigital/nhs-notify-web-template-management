import type {
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
import { FrontendSupportedAccessibleFormats } from 'nhs-notify-web-template-management-utils';

export type ChooseChannelTemplateProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  noTemplatesText: string;
  templateList: TemplateDto[];
  cascadeIndex: number;
  accessibleFormat?: FrontendSupportedAccessibleFormats;
  lockNumber: number;
};
