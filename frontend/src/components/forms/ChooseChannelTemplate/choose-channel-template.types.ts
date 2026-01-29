import { RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';
import { RoutingAccessibleFormatLetterType } from 'nhs-notify-web-template-management-utils';

export type ChooseChannelTemplateProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  noTemplatesText: string;
  templateList: TemplateDto[];
  cascadeIndex: number;
  accessibleFormat?: RoutingAccessibleFormatLetterType;
  lockNumber: number;
};
