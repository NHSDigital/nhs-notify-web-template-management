import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { TemplateDto } from 'nhs-notify-backend-client';

export type PreviewTemplateProps = {
  sectionHeading: string | undefined;
  template: TemplateDto;
  previewDetailsComponent: React.ReactElement<
    | typeof PreviewTemplateDetailsEmail
    | typeof PreviewTemplateDetailsNhsApp
    | typeof PreviewTemplateDetailsSms
  >;
  form: NHSNotifyRadioButtonFormProps;
  editPath: string;
};
