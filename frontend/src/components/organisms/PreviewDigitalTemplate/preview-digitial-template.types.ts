import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  PreviewTemplateDetailsEmail,
  PreviewTemplateDetailsNhsApp,
  PreviewTemplateDetailsSms,
} from '@molecules/PreviewTemplateDetails';

export type PreviewTemplateProps = {
  sectionHeading: string | undefined;
  template: TemplateDto;
  form: {
    errorHeading: string;
  } & NHSNotifyRadioButtonFormProps;
  previewDetailsComponent: React.ReactElement<
    | typeof PreviewTemplateDetailsEmail
    | typeof PreviewTemplateDetailsNhsApp
    | typeof PreviewTemplateDetailsSms
  >;
};
