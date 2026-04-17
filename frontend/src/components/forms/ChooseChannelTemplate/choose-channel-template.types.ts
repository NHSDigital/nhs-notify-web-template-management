import type {
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
import { FrontendSupportedAccessibleFormats } from 'nhs-notify-web-template-management-utils';

// Props that are preserved in server action state (round-trip with each submission).
// lockNumber is excluded because it is consumed directly from FormData, not from state.
export type ChooseChannelTemplateFormProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  templateList: TemplateDto[];
  cascadeIndex: number;
  accessibleFormat?: FrontendSupportedAccessibleFormats;
};

export type ChooseChannelTemplateProps = ChooseChannelTemplateFormProps & {
  lockNumber: number;
  noTemplatesText: string;
  hintText: string;
};
