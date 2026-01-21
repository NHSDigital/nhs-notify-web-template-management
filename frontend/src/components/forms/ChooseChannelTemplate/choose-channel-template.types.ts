import {
  LetterType,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';

export type ChooseChannelTemplateProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  noTemplatesText: string;
  templateList: TemplateDto[];
  cascadeIndex: number;
  accessibleFormat?: Exclude<LetterType, 'x0'>;
  lockNumber: number;
};
