import { RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';

export type ChooseChannelTemplateProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  templateList: TemplateDto[];
  cascadeIndex: number;
};
